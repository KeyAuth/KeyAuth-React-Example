"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import KeyAuth from '@/lib/keyauth';
import { sessionStorage } from '@/lib/cookies';
import * as KeyAuthConfig from '@/credentials';

interface KeyAuthUserData {
  username: string;
  ip: string;
  hwid: string;
  expires: number;
  createdate: number;
  lastlogin: number;
  subscription: string;
  subscriptions: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: KeyAuthUserData | null;
  keyauth: KeyAuth | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string; needsTwoFA?: boolean }>;
  loginWith2FA: (username: string, password: string, code: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, password: string, license: string) => Promise<{ success: boolean; message: string }>;
  licenseAuth: (license: string, code?: string) => Promise<{ success: boolean; message: string; needsTwoFA?: boolean }>;
  licenseAuthWith2FA: (license: string, code: string) => Promise<{ success: boolean; message: string }>;
  upgrade: (username: string, license: string) => Promise<{ success: boolean; message: string }>;
  enable2FA: (code?: string) => Promise<{ success: boolean; message: string; qrCode?: string; secret?: string }>;
  disable2FA: (code: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<KeyAuthUserData | null>(null);
  const [keyauth, setKeyauth] = useState<KeyAuth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeKeyAuth = async () => {
      try {
        console.log("[AUTH] Initializing KeyAuth")

        const ka = new KeyAuth({
          name: KeyAuthConfig.name,
          ownerid: KeyAuthConfig.ownerid,
          url: KeyAuthConfig.url,
        })

        const result = await ka.init();
        console.log("[AUTH] KeyAuth initialized:", result)

        if (result.success) {
          setKeyauth(ka);

          try {
            await ka.fetchStats();
            console.log("[AUTH] Application stats fetched:", ka.app_data);
          } catch (error) {
            console.error("[AUTH] Failed to fetch stats:", error);
          }

          const user = sessionStorage.getUser();
          if (user) {
            console.log("[AUTH] Found saved user:", user)
            setUser(user);
            setIsAuthenticated(true);
          }
        } else {
          console.log("[AUTH] KeyAuth init failed:", result.message)
        }
      } catch (error) {
        console.error("[AUTH] KeyAuth initialization error:", error)
      } finally {
        setLoading(false);
      }
    }

    initializeKeyAuth();
  }, []);

  const login = async (username: string, password: string) => {
    if (!keyauth) {
      return { success: false, message: 'KeyAuth not initialized' };
    }

    console.log('[Auth Debug] Attempting login for user:', username);
    const result = await keyauth.login(username, password);
    console.log('[Auth Debug] Login result:', result);
    
    if (result.success && result.user_data) {
      setUser(result.user_data);
      setIsAuthenticated(true);
      sessionStorage.setUser(result.user_data);
      return { success: true, message: result.message };
    } else if (result.message && result.message.toLowerCase().includes('2fa')) {
      return { success: false, message: result.message, needsTwoFA: true };
    }
    
    return { success: false, message: result.message };
  };

  const loginWith2FA = async (username: string, password: string, code: string) => {
    if (!keyauth) {
      return { success: false, message: 'KeyAuth not initialized' };
    }

    console.log('[Auth Debug] Attempting 2FA login for user:', username);
    const result = await keyauth.login(username, password, code);
    console.log('[Auth Debug] 2FA Login result:', result);
    
    if (result.success && result.user_data) {
      setUser(result.user_data);
      setIsAuthenticated(true);
      sessionStorage.setUser(result.user_data);
      return { success: true, message: result.message };
    }
    
    return { success: false, message: result.message };
  };

  const register = async (username: string, password: string, license: string) => {
    if (!keyauth) {
      return { success: false, message: 'KeyAuth not initialized' };
    }

    console.log('[Auth Debug] Attempting registration for user:', username);
    const result = await keyauth.register(username, password, license);
    console.log('[Auth Debug] Register result:', result);
    
    if (result.success && result.user_data) {
      setUser(result.user_data);
      setIsAuthenticated(true);
      sessionStorage.setUser(result.user_data);
      return { success: true, message: result.message };
    }
    
    return { success: false, message: result.message };
  };

  const licenseAuth = async (license: string, code?: string) => {
    if (!keyauth) {
      return { success: false, message: 'KeyAuth not initialized' };
    }

    console.log('[Auth Debug] Attempting license authentication');
    const result = await keyauth.license(license, code);
    console.log('[Auth Debug] License result:', result);
    
    if (result.success && result.user_data) {
      setUser(result.user_data);
      setIsAuthenticated(true);
      sessionStorage.setUser(result.user_data);
      return { success: true, message: result.message };
    } else if (result.message && result.message.toLowerCase().includes('2fa')) {
      return { success: false, message: result.message, needsTwoFA: true };
    }
    
    return { success: false, message: result.message };
  };

  const licenseAuthWith2FA = async (license: string, code: string) => {
    if (!keyauth) {
      return { success: false, message: 'KeyAuth not initialized' };
    }

    console.log('[Auth Debug] Attempting 2FA license authentication');
    const result = await keyauth.license(license, code);
    console.log('[Auth Debug] 2FA License result:', result);
    
    if (result.success && result.user_data) {
      setUser(result.user_data);
      setIsAuthenticated(true);
      sessionStorage.setUser(result.user_data);
      return { success: true, message: result.message };
    }
    
    return { success: false, message: result.message };
  };

  const enable2FA = async (code?: string) => {
    if (!keyauth) {
      return { success: false, message: 'KeyAuth not initialized' };
    }

    console.log('[Auth Debug] Attempting to enable 2FA with code:', !!code);
    const result = await keyauth.enable2FA(code);
    console.log('[Auth Debug] Enable 2FA result:', result);
    
    if (result.success) {
      return { 
        success: true, 
        message: result.message,
        qrCode: result['2fa']?.QRCode,
        secret: result['2fa']?.secret_code
      };
    }
    
    return { success: false, message: result.message };
  };

  const disable2FA = async (code: string) => {
    if (!keyauth) {
      return { success: false, message: 'KeyAuth not initialized' };
    }

    console.log('[Auth Debug] Attempting to disable 2FA');
    const result = await keyauth.disable2FA(code);
    console.log('[Auth Debug] Disable 2FA result:', result);
    
    return { success: result.success, message: result.message };
  };

  const upgrade = async (username: string, license: string) => {
    if (!keyauth) {
      return { success: false, message: 'KeyAuth not initialized' };
    }

    console.log('[Auth Debug] Attempting upgrade for user:', username);
    const result = await keyauth.upgrade(username, license);
    console.log('[Auth Debug] Upgrade result:', result);
    
    return { success: result.success, message: result.message };
  };

  const logout = () => {
    console.log('[Auth Debug] Logging out user');
    await keyauth.logout();
    setUser(null);
    setIsAuthenticated(false);
    sessionStorage.clearAll();
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      keyauth,
      login,
      loginWith2FA,
      register,
      licenseAuth,
      licenseAuthWith2FA,
      upgrade,
      enable2FA,
      disable2FA,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
