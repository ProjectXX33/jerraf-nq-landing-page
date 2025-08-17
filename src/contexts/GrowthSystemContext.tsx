import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface GrowthSystemSettings {
  isEnabled: boolean;
  isAdminLoggedIn: boolean;
  loginTimestamp?: number;
  sessionDuration: number;
}

interface GrowthSystemContextType {
  settings: GrowthSystemSettings;
  toggleGrowthSystem: (enabled: boolean) => void;
  login: (password: string) => boolean;
  logout: () => void;
  isSessionValid: () => boolean;
  getSessionInfo: () => {
    timeRemaining: number;
    isValid: boolean;
    expiresAt: Date | null;
  };
}

const GrowthSystemContext = createContext<GrowthSystemContextType | undefined>(undefined);

interface GrowthSystemProviderProps {
  children: ReactNode;
}

const ADMIN_PASSWORD = '?X{g^w33l@)J3S2vP';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const GrowthSystemProvider: React.FC<GrowthSystemProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<GrowthSystemSettings>(() => {
    // Initialize from localStorage only once on mount, then use state
    try {
      const stored = localStorage.getItem('nq_admin_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          isEnabled: parsed.growthSystemEnabled ?? true,
          isAdminLoggedIn: parsed.isLoggedIn ?? false,
          loginTimestamp: parsed.loginTimestamp,
          sessionDuration: SESSION_DURATION
        };
      }
    } catch (error) {
      console.error('Error loading initial admin settings:', error);
    }
    
    return {
      isEnabled: true,
      isAdminLoggedIn: false,
      sessionDuration: SESSION_DURATION
    };
  });

  // Sync to localStorage and AdminUtils when settings change (but state is the source of truth)
  useEffect(() => {
    try {
      const adminSettings = {
        growthSystemEnabled: settings.isEnabled,
        isLoggedIn: settings.isAdminLoggedIn,
        loginTimestamp: settings.loginTimestamp,
        sessionDuration: settings.sessionDuration
      };
      
      // Update localStorage for persistence
      localStorage.setItem('nq_admin_settings', JSON.stringify(adminSettings));
      
      // Update AdminUtils current state for immediate access
      const { AdminUtils } = require('../utils/adminUtils');
      AdminUtils.updateCurrentState(adminSettings);
      
      // Dispatch events for backward compatibility
      window.dispatchEvent(new CustomEvent('adminSettingsChanged', { 
        detail: adminSettings 
      }));
      
      window.dispatchEvent(new CustomEvent('growthSystemToggled', { 
        detail: { enabled: settings.isEnabled } 
      }));
    } catch (error) {
      console.error('Error syncing admin settings:', error);
    }
  }, [settings]);

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

  const toggleGrowthSystem = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      isEnabled: enabled
    }));
  };

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setSettings(prev => ({
        ...prev,
        isAdminLoggedIn: true,
        loginTimestamp: Date.now()
      }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setSettings(prev => ({
      ...prev,
      isAdminLoggedIn: false,
      loginTimestamp: undefined
    }));
  };

  const isSessionValid = (): boolean => {
    if (!settings.isAdminLoggedIn || !settings.loginTimestamp) {
      return false;
    }

    const now = Date.now();
    const sessionAge = now - settings.loginTimestamp;
    return sessionAge <= settings.sessionDuration;
  };

  const getSessionInfo = () => {
    if (!settings.isAdminLoggedIn || !settings.loginTimestamp) {
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
  };

  const contextValue: GrowthSystemContextType = {
    settings,
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
