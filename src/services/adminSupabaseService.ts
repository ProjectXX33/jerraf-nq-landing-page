import { supabase, AdminSetting, AdminSession } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface AdminSettings {
  isLoggedIn: boolean;
  growthSystemEnabled: boolean;
  loginTimestamp?: number;
  sessionDuration: number;
  sessionToken?: string;
}

export class AdminSupabaseService {
  private static realtimeChannel: RealtimeChannel | null = null;
  private static listeners: Array<(settings: AdminSettings) => void> = [];
  private static currentSettings: AdminSettings | null = null;

  // Initialize real-time subscription
  static async initialize(): Promise<void> {
    console.log('🚀 Initializing AdminSupabaseService...');
    
    // Load initial settings
    await this.loadSettings();
    
    // Subscribe to real-time changes
    this.subscribeToChanges();
  }

  // Load settings from database - Growth System from DB, Sessions from localStorage
  static async loadSettings(): Promise<AdminSettings> {
    try {
      // Get growth system enabled status from database (real-time)
      const { data: growthData } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'growth_system_enabled')
        .single();

      // Get session info from localStorage (per-browser)
      const localSession = this.getLocalSession();

      const settings: AdminSettings = {
        growthSystemEnabled: growthData?.setting_value === true || growthData?.setting_value === 'true',
        isLoggedIn: localSession.isLoggedIn,
        loginTimestamp: localSession.loginTimestamp,
        sessionDuration: localSession.sessionDuration,
        sessionToken: localSession.sessionToken
      };

      this.currentSettings = settings;
      console.log('📥 Loaded settings - Growth from DB, Session from localStorage:', settings);
      return settings;
    } catch (error) {
      console.error('Error loading admin settings:', error);
      const defaultSettings: AdminSettings = {
        growthSystemEnabled: true,
        isLoggedIn: false,
        sessionDuration: 86400000
      };
      this.currentSettings = defaultSettings;
      return defaultSettings;
    }
  }

  // Get local session from localStorage (per-browser)
  private static getLocalSession(): {
    isLoggedIn: boolean;
    loginTimestamp?: number;
    sessionDuration: number;
    sessionToken?: string;
  } {
    try {
      const stored = localStorage.getItem('nq_local_admin_session');
      if (stored) {
        const session = JSON.parse(stored);
        
        // Check if session is still valid
        if (session.isLoggedIn && session.loginTimestamp) {
          const now = Date.now();
          const sessionAge = now - session.loginTimestamp;
          
          if (sessionAge > session.sessionDuration) {
            // Session expired - clear it
            this.clearLocalSession();
            return { isLoggedIn: false, sessionDuration: 86400000 };
          }
        }
        
        return {
          isLoggedIn: session.isLoggedIn || false,
          loginTimestamp: session.loginTimestamp,
          sessionDuration: session.sessionDuration || 86400000,
          sessionToken: session.sessionToken
        };
      }
    } catch (error) {
      console.error('Error reading local session:', error);
    }
    
    return { isLoggedIn: false, sessionDuration: 86400000 };
  }

  // Save local session to localStorage (per-browser)
  private static saveLocalSession(session: {
    isLoggedIn: boolean;
    loginTimestamp?: number;
    sessionDuration: number;
    sessionToken?: string;
  }): void {
    try {
      localStorage.setItem('nq_local_admin_session', JSON.stringify(session));
    } catch (error) {
      console.error('Error saving local session:', error);
    }
  }

  // Clear local session
  private static clearLocalSession(): void {
    try {
      localStorage.removeItem('nq_local_admin_session');
    } catch (error) {
      console.error('Error clearing local session:', error);
    }
  }

  // Subscribe to real-time changes - ONLY for Growth System, NOT for sessions
  static subscribeToChanges(): void {
    if (this.realtimeChannel) {
      this.realtimeChannel.unsubscribe();
    }

    console.log('🔄 Setting up real-time subscription for admin_settings...');

    this.realtimeChannel = supabase
      .channel('admin_settings_realtime', {
        config: {
          broadcast: { self: true },
          presence: { key: 'admin' }
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_settings',
          filter: 'setting_key=eq.growth_system_enabled'
        },
        async (payload) => {
          console.log('🚨 ADMIN SETTINGS REAL-TIME UPDATE:', payload);
          
          // Only update growth system state, keep current session state
          const currentSettings = this.getCurrentSettings();
          if (currentSettings && payload.new && 'setting_value' in payload.new) {
            console.log('🔄 Updating global growth system state...');
            
            // Update only growth system setting, preserve session info
            const updatedSettings: AdminSettings = {
              ...currentSettings,
              growthSystemEnabled: payload.new.setting_value === true || payload.new.setting_value === 'true'
            };

            console.log('📤 Notifying listeners with new settings:', updatedSettings);
            this.notifyListeners(updatedSettings);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_growth_access'
        },
        async (payload) => {
          // Safely extract order data with type checking
          const newData = payload.new as any;
          const oldData = payload.old as any;
          
          // Dispatch custom event for order growth access changes
          window.dispatchEvent(new CustomEvent('orderGrowthAccessChanged', {
            detail: {
              type: payload.eventType,
              orderId: newData?.order_id || oldData?.order_id,
              orderNumber: newData?.order_number || oldData?.order_number,
              isEnabled: newData?.is_growth_enabled,
              data: payload.new || payload.old
            }
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_growth_access'
        },
        async (payload) => {
          console.log('🚨 CUSTOMER GROWTH ACCESS REAL-TIME UPDATE:', payload);
          
          // Safely extract customer data with type checking
          const newData = payload.new as any;
          const oldData = payload.old as any;
          
          // Dispatch custom event for customer growth access changes
          window.dispatchEvent(new CustomEvent('customerGrowthSettingsChanged', {
            detail: {
              type: payload.eventType,
              customerEmail: newData?.customer_email || oldData?.customer_email,
              isEnabled: newData?.is_enabled,
              data: payload.new || payload.old
            }
          }));
        }
      )
      .subscribe((status, err) => {
        console.log('📡 Realtime subscription status:', status);
        if (err) {
          console.error('❌ Realtime subscription error:', err);
        }
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to ALL real-time changes!');
        }
      });
  }

  // Add listener for settings changes
  static addListener(callback: (settings: AdminSettings) => void): void {
    this.listeners.push(callback);
  }

  // Remove listener
  static removeListener(callback: (settings: AdminSettings) => void): void {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  // Notify all listeners
  static notifyListeners(settings: AdminSettings): void {
    this.currentSettings = settings;
    this.listeners.forEach(callback => callback(settings));
  }

  // Get current settings (cached)
  static getCurrentSettings(): AdminSettings | null {
    return this.currentSettings;
  }

  // Toggle growth system
  static async toggleGrowthSystem(enabled: boolean, updatedBy: string = 'admin'): Promise<void> {
    try {
      console.log(`🔄 Toggling growth system to: ${enabled}`);
      
      const { data, error } = await supabase
        .from('admin_settings')
        .update({ 
          setting_value: enabled, // This should be a proper boolean
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'growth_system_enabled')
        .select();

      if (error) {
        console.error('❌ Database update error:', error);
        throw error;
      }

      console.log('✅ Database updated successfully:', data);
      console.log(`✅ Growth system ${enabled ? 'enabled' : 'disabled'} in database`);
      
      // Force a manual refresh of settings to trigger listeners
      setTimeout(async () => {
        console.log('🔄 Force refreshing settings...');
        const newSettings = await this.loadSettings();
        this.notifyListeners(newSettings);
      }, 100);
      
    } catch (error) {
      console.error('❌ Error toggling growth system:', error);
      throw error;
    }
  }

  // Admin login - Save to localStorage only (per-browser)
  static async login(password: string): Promise<{ success: boolean; sessionToken?: string; error?: string }> {
    const ADMIN_PASSWORD = '?X{g^w33l@)J3S2vP';
    
    if (password !== ADMIN_PASSWORD) {
      return { success: false, error: 'Invalid password' };
    }

    try {
      // Generate session token
      const sessionToken = `local_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const loginTimestamp = Date.now();
      
      // Save session to localStorage (this browser only)
      this.saveLocalSession({
        isLoggedIn: true,
        loginTimestamp,
        sessionDuration: 86400000, // 24 hours
        sessionToken
      });

      // Optional: Log to database for analytics (but don't use for auth)
      try {
        await supabase
          .from('admin_sessions')
          .insert({
            session_token: sessionToken,
            is_active: true,
            login_timestamp: new Date(loginTimestamp).toISOString(),
            session_duration: 86400000,
            ip_address: await this.getClientIP(),
            user_agent: navigator.userAgent
          });
      } catch (logError) {
        console.warn('Failed to log session to database:', logError);
        // Continue anyway - local auth is what matters
      }

      console.log('✅ Admin logged in successfully (local session)');
      return { success: true, sessionToken };
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  // Admin logout - Clear localStorage only (per-browser)
  static async logout(sessionToken?: string): Promise<void> {
    try {
      // Clear local session (this browser only)
      this.clearLocalSession();

      // Optional: Update database for analytics (but don't use for auth)
      try {
        if (sessionToken) {
          await supabase
            .from('admin_sessions')
            .update({ 
              is_active: false,
              logout_timestamp: new Date().toISOString()
            })
            .eq('session_token', sessionToken);
        }
      } catch (logError) {
        console.warn('Failed to log logout to database:', logError);
        // Continue anyway - local auth is what matters
      }

      console.log('✅ Admin logged out successfully (local session cleared)');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  // Check if session is valid (from localStorage)
  static async isSessionValid(sessionToken: string): Promise<boolean> {
    try {
      const localSession = this.getLocalSession();
      
      if (!localSession.isLoggedIn || localSession.sessionToken !== sessionToken) {
        return false;
      }
      
      if (!localSession.loginTimestamp) {
        return false;
      }
      
      const now = Date.now();
      const sessionAge = now - localSession.loginTimestamp;
      return sessionAge <= localSession.sessionDuration;
      
    } catch (error) {
      console.error('Error checking session validity:', error);
      return false;
    }
  }

  // Get session info (from localStorage)
  static async getSessionInfo(sessionToken: string): Promise<{
    timeRemaining: number;
    isValid: boolean;
    expiresAt: Date | null;
  }> {
    try {
      const localSession = this.getLocalSession();
      
      if (!localSession.isLoggedIn || localSession.sessionToken !== sessionToken) {
        return { timeRemaining: 0, isValid: false, expiresAt: null };
      }
      
      if (!localSession.loginTimestamp) {
        return { timeRemaining: 0, isValid: false, expiresAt: null };
      }

      const now = Date.now();
      const sessionAge = now - localSession.loginTimestamp;
      const timeRemaining = Math.max(0, localSession.sessionDuration - sessionAge);
      const expiresAt = new Date(localSession.loginTimestamp + localSession.sessionDuration);

      return {
        timeRemaining,
        isValid: timeRemaining > 0,
        expiresAt
      };
    } catch (error) {
      console.error('Error getting session info:', error);
      return { timeRemaining: 0, isValid: false, expiresAt: null };
    }
  }

  // Cleanup - unsubscribe from real-time
  static cleanup(): void {
    if (this.realtimeChannel) {
      this.realtimeChannel.unsubscribe();
      this.realtimeChannel = null;
    }
    this.listeners = [];
  }

  // Helper function to get client IP (simplified)
  private static async getClientIP(): Promise<string> {
    try {
      // In a real app, you might want to use a service to get the real IP
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  // Log activity
  static async logActivity(
    activityType: string, 
    description: string, 
    metadata?: any, 
    performedBy: string = 'admin'
  ): Promise<void> {
    try {
      await supabase
        .from('system_activity_log')
        .insert({
          activity_type: activityType,
          description,
          metadata,
          performed_by: performedBy,
          ip_address: await this.getClientIP()
        });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }
}
