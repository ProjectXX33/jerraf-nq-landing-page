// Admin utilities for managing dashboard and Growth System settings
// NOTE: This class now primarily serves as a compatibility layer.
// The main state management is handled by GrowthSystemContext for real-time updates.

export interface AdminSettings {
  isLoggedIn: boolean;
  growthSystemEnabled: boolean;
  loginTimestamp?: number;
  sessionDuration: number; // in milliseconds
}

export class AdminUtils {
  private static readonly ADMIN_STORAGE_KEY = 'nq_admin_settings';
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly ADMIN_PASSWORD = '?X{g^w33l@)J3S2vP'; // Secure admin password
  
  // Global state holder for immediate access (updated by context)
  private static currentState: AdminSettings | null = null;

  // Update current state from context (called by GrowthSystemContext)
  static updateCurrentState(state: AdminSettings): void {
    this.currentState = state;
  }

  // Get admin settings - prioritizes current state over localStorage
  static getAdminSettings(): AdminSettings {
    const defaultSettings: AdminSettings = {
      isLoggedIn: false,
      growthSystemEnabled: true, // Default enabled
      sessionDuration: this.SESSION_DURATION
    };

    // If we have current state from context, use it (real-time)
    if (this.currentState) {
      return this.currentState;
    }

    // Fallback to localStorage for backward compatibility
    try {
      const stored = localStorage.getItem(this.ADMIN_STORAGE_KEY);
      if (!stored) return defaultSettings;

      const settings: AdminSettings = {
        ...defaultSettings,
        ...JSON.parse(stored)
      };

      // Check if session is still valid
      if (settings.isLoggedIn && settings.loginTimestamp) {
        const now = Date.now();
        const sessionAge = now - settings.loginTimestamp;
        
        if (sessionAge > settings.sessionDuration) {
          // Session expired
          settings.isLoggedIn = false;
          this.saveAdminSettings(settings);
        }
      }

      return settings;
    } catch (error) {
      console.error('Error loading admin settings:', error);
      return defaultSettings;
    }
  }

  // Save admin settings to localStorage
  static saveAdminSettings(settings: AdminSettings): void {
    try {
      localStorage.setItem(this.ADMIN_STORAGE_KEY, JSON.stringify(settings));
      
      // Trigger custom event for settings change
      window.dispatchEvent(new CustomEvent('adminSettingsChanged', { 
        detail: settings 
      }));
    } catch (error) {
      console.error('Error saving admin settings:', error);
    }
  }

  // Admin login
  static login(password: string): boolean {
    if (password === this.ADMIN_PASSWORD) {
      const settings = this.getAdminSettings();
      settings.isLoggedIn = true;
      settings.loginTimestamp = Date.now();
      this.saveAdminSettings(settings);
      return true;
    }
    return false;
  }

  // Admin logout
  static logout(): void {
    const settings = this.getAdminSettings();
    settings.isLoggedIn = false;
    settings.loginTimestamp = undefined;
    this.saveAdminSettings(settings);
  }

  // Check if admin is logged in
  static isLoggedIn(): boolean {
    return this.getAdminSettings().isLoggedIn;
  }

  // Toggle Growth System
  static toggleGrowthSystem(enabled: boolean): void {
    const settings = this.getAdminSettings();
    settings.growthSystemEnabled = enabled;
    this.saveAdminSettings(settings);
    
    // Trigger custom event for Growth System state change
    window.dispatchEvent(new CustomEvent('growthSystemToggled', { 
      detail: { enabled } 
    }));
  }

  // Check if Growth System is enabled
  static isGrowthSystemEnabled(): boolean {
    return this.getAdminSettings().growthSystemEnabled;
  }

  // Get session info
  static getSessionInfo(): { 
    timeRemaining: number; 
    isValid: boolean; 
    expiresAt: Date | null 
  } {
    const settings = this.getAdminSettings();
    
    if (!settings.isLoggedIn || !settings.loginTimestamp) {
      return {
        timeRemaining: 0,
        isValid: false,
        expiresAt: null
      };
    }

    const now = Date.now();
    const sessionAge = now - settings.loginTimestamp;
    const timeRemaining = Math.max(0, settings.sessionDuration - sessionAge);
    const expiresAt = new Date(settings.loginTimestamp + settings.sessionDuration);

    return {
      timeRemaining,
      isValid: timeRemaining > 0,
      expiresAt
    };
  }

  // Format time remaining
  static formatTimeRemaining(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} ساعة و ${minutes} دقيقة`;
    } else {
      return `${minutes} دقيقة`;
    }
  }

  // Reset all admin settings (for development)
  static resetSettings(): void {
    localStorage.removeItem(this.ADMIN_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('adminSettingsChanged'));
  }
}

// Development helper functions
if (import.meta.env.DEV) {
  (window as any).AdminUtils = AdminUtils;
  console.log('🔐 Admin Utils available in console as: AdminUtils');
  console.log('📝 Available commands:');
  console.log('  - AdminUtils.login("nq2024admin")');
  console.log('  - AdminUtils.logout()');
  console.log('  - AdminUtils.toggleGrowthSystem(false)');
  console.log('  - AdminUtils.resetSettings()');
}
