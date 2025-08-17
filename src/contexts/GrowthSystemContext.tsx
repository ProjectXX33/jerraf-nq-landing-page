import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminSupabaseService, AdminSettings as SupabaseAdminSettings } from '../services/adminSupabaseService';

export interface GrowthSystemSettings {
  isEnabled: boolean;
  isAdminLoggedIn: boolean;
  loginTimestamp?: number;
  sessionDuration: number;
}

interface GrowthSystemContextType {
  settings: GrowthSystemSettings;
  isInitialized: boolean;
  toggleGrowthSystem: (enabled: boolean) => Promise<void>;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isSessionValid: () => boolean;
  getSessionInfo: () => Promise<{
    timeRemaining: number;
    isValid: boolean;
    expiresAt: Date | null;
  }>;
}

const GrowthSystemContext = createContext<GrowthSystemContextType | undefined>(undefined);

interface GrowthSystemProviderProps {
  children: ReactNode;
}

const ADMIN_PASSWORD = '?X{g^w33l@)J3S2vP';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const GrowthSystemProvider: React.FC<GrowthSystemProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<GrowthSystemSettings>({
    isEnabled: true,
    isAdminLoggedIn: false,
    sessionDuration: SESSION_DURATION
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Initialize Supabase service and subscribe to real-time changes
  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        // Initialize Supabase service
        await AdminSupabaseService.initialize();
        
        // Get initial settings from database
        const supabaseSettings = await AdminSupabaseService.loadSettings();
        
        // Check for existing local session (session management is per-browser)
        const sessionInfo = await AdminSupabaseService.getSessionInfo('local_session');
        
        // Convert Supabase settings to our format
        const contextSettings: GrowthSystemSettings = {
          isEnabled: supabaseSettings.growthSystemEnabled,
          isAdminLoggedIn: sessionInfo.isValid, // Use local session, not Supabase
          loginTimestamp: sessionInfo.isValid ? Date.now() : undefined,
          sessionDuration: SESSION_DURATION
        };
        
        setSettings(contextSettings);
        setSessionToken(sessionInfo.isValid ? 'local_session' : null);
        
        console.log('🚀 CONTEXT: Initialized with settings:', contextSettings);
        setIsInitialized(true);
        
        // Set up real-time listener
        const handleSupabaseChange = (newSupabaseSettings: SupabaseAdminSettings) => {
          console.log('🎯 CONTEXT: Received Supabase change:', newSupabaseSettings);
          
          const newContextSettings: GrowthSystemSettings = {
            isEnabled: newSupabaseSettings.growthSystemEnabled,
            isAdminLoggedIn: newSupabaseSettings.isLoggedIn,
            loginTimestamp: newSupabaseSettings.loginTimestamp,
            sessionDuration: newSupabaseSettings.sessionDuration
          };
          
          console.log('🎯 CONTEXT: Updating context state:', newContextSettings);
          setSettings(newContextSettings);
          setSessionToken(newSupabaseSettings.sessionToken || null);
          
          // Update AdminUtils for backward compatibility
          const { AdminUtils } = require('../utils/adminUtils');
          AdminUtils.updateCurrentState({
            growthSystemEnabled: newSupabaseSettings.growthSystemEnabled,
            isLoggedIn: newSupabaseSettings.isLoggedIn,
            loginTimestamp: newSupabaseSettings.loginTimestamp,
            sessionDuration: newSupabaseSettings.sessionDuration
          });
          
          // Dispatch events for backward compatibility
          window.dispatchEvent(new CustomEvent('adminSettingsChanged', { 
            detail: {
              growthSystemEnabled: newSupabaseSettings.growthSystemEnabled,
              isLoggedIn: newSupabaseSettings.isLoggedIn,
              loginTimestamp: newSupabaseSettings.loginTimestamp,
              sessionDuration: newSupabaseSettings.sessionDuration
            }
          }));
          
          window.dispatchEvent(new CustomEvent('growthSystemToggled', { 
            detail: { enabled: newSupabaseSettings.growthSystemEnabled } 
          }));
          
          console.log('✅ CONTEXT: State updated and events dispatched');
        };
        
        AdminSupabaseService.addListener(handleSupabaseChange);
        
        // Cleanup function
        return () => {
          AdminSupabaseService.removeListener(handleSupabaseChange);
        };
        
      } catch (error) {
        console.error('Error initializing Supabase:', error);
        setIsInitialized(true); // Still mark as initialized to prevent hanging
      }
    };
    
    initializeSupabase();
    
    // Cleanup on unmount
    return () => {
      AdminSupabaseService.cleanup();
    };
  }, []);

  // Check session validity periodically
  useEffect(() => {
    if (!settings.isAdminLoggedIn || !settings.loginTimestamp) return;

    const checkSession = () => {
      const now = Date.now();
      const sessionAge = now - settings.loginTimestamp!;
      
      if (sessionAge > settings.sessionDuration) {
        // Session expired - logout immediately
        setSettings(prev => ({
          ...prev,
          isAdminLoggedIn: false,
          loginTimestamp: undefined
        }));
      }
    };

    // Check immediately
    checkSession();
    
    // Check every minute
    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, [settings.isAdminLoggedIn, settings.loginTimestamp, settings.sessionDuration]);

  const toggleGrowthSystem = async (enabled: boolean) => {
    try {
      await AdminSupabaseService.toggleGrowthSystem(enabled, 'admin');
      // The real-time listener will update the state automatically
    } catch (error) {
      console.error('Error toggling growth system:', error);
      // Fallback: update local state if Supabase fails
      setSettings(prev => ({
        ...prev,
        isEnabled: enabled
      }));
    }
  };

  const login = async (password: string): Promise<boolean> => {
    try {
      console.log('🔐 CONTEXT: Starting login process...');
      const result = await AdminSupabaseService.login(password);
      if (result.success && result.sessionToken) {
        console.log('✅ CONTEXT: Login successful, updating state...');
        setSessionToken(result.sessionToken);
        
        // Update React state immediately (sessions are local per browser)
        setSettings(prev => ({
          ...prev,
          isAdminLoggedIn: true,
          loginTimestamp: Date.now()
        }));
        
        console.log('✅ CONTEXT: Login state updated');
        return true;
      }
      console.log('❌ CONTEXT: Login failed');
      return false;
    } catch (error) {
      console.error('❌ CONTEXT: Error during login:', error);
      // Fallback to local authentication if Supabase fails
      if (password === ADMIN_PASSWORD) {
        console.log('✅ CONTEXT: Fallback login successful');
        setSettings(prev => ({
          ...prev,
          isAdminLoggedIn: true,
          loginTimestamp: Date.now()
        }));
        return true;
      }
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 CONTEXT: Starting logout process...');
      await AdminSupabaseService.logout(sessionToken || undefined);
      setSessionToken(null);
      
      // Update React state immediately (sessions are local per browser)
      setSettings(prev => ({
        ...prev,
        isAdminLoggedIn: false,
        loginTimestamp: undefined
      }));
      
      console.log('✅ CONTEXT: Logout state updated');
    } catch (error) {
      console.error('❌ CONTEXT: Error during logout:', error);
      // Fallback: update local state if Supabase fails
      setSettings(prev => ({
        ...prev,
        isAdminLoggedIn: false,
        loginTimestamp: undefined
      }));
      setSessionToken(null);
      console.log('✅ CONTEXT: Fallback logout completed');
    }
  };

  const isSessionValid = (): boolean => {
    if (!settings.isAdminLoggedIn || !settings.loginTimestamp) {
      return false;
    }

    const now = Date.now();
    const sessionAge = now - settings.loginTimestamp;
    return sessionAge <= settings.sessionDuration;
  };

  const getSessionInfo = async () => {
    if (!sessionToken || !settings.isAdminLoggedIn) {
      return {
        timeRemaining: 0,
        isValid: false,
        expiresAt: null
      };
    }

    try {
      // Get real-time session info from Supabase
      const sessionInfo = await AdminSupabaseService.getSessionInfo(sessionToken);
      return sessionInfo;
    } catch (error) {
      console.error('Error getting session info from Supabase:', error);
      // Fallback to local calculation
      if (!settings.loginTimestamp) {
        return { timeRemaining: 0, isValid: false, expiresAt: null };
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
  };

  const contextValue: GrowthSystemContextType = {
    settings,
    isInitialized,
    toggleGrowthSystem,
    login,
    logout,
    isSessionValid,
    getSessionInfo
  };

  return (
    <GrowthSystemContext.Provider value={contextValue}>
      {children}
    </GrowthSystemContext.Provider>
  );
};

export const useGrowthSystem = (): GrowthSystemContextType => {
  const context = useContext(GrowthSystemContext);
  if (context === undefined) {
    throw new Error('useGrowthSystem must be used within a GrowthSystemProvider');
  }
  return context;
};

// Utility function to format time remaining - moved to separate module to fix HMR
export const formatTimeRemaining = (milliseconds: number): string => {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours} ساعة و ${minutes} دقيقة`;
  } else {
    return `${minutes} دقيقة`;
  }
};
