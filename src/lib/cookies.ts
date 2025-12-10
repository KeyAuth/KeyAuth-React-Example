export interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  path?: string;
}

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

export const cookies = {
  set: (name: string, value: string, options: CookieOptions = {}) => {
    if (typeof document === 'undefined') return;
    
    let cookieString = `${name}=${encodeURIComponent(value)}`;
    
    if (options.maxAge) {
      cookieString += `; max-age=${options.maxAge}`;
    }
    
    if (options.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }
    
    if (options.path) {
      cookieString += `; path=${options.path}`;
    } else {
      cookieString += `; path=/`;
    }
    
    if (options.secure) {
      cookieString += `; secure`;
    }
    
    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }
    
    document.cookie = cookieString;
  },
  
  get: (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  },
  
  remove: (name: string, path: string = '/') => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
  }
};

export const sessionStorage = {
  setUser: (userData: KeyAuthUserData) => {
    cookies.set('keyauth_user', JSON.stringify(userData), {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  },
  
  getUser: (): KeyAuthUserData | null => {
    const userData = cookies.get('keyauth_user');
    return userData ? JSON.parse(userData) : null;
  },
  
  setAuth: (sessionId: string) => {
    cookies.set('keyauth_session', sessionId, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  },
  
  getAuth: () => {
    return cookies.get('keyauth_session');
  },
  
  clearAll: () => {
    cookies.remove('keyauth_user');
    cookies.remove('keyauth_session');
  }
};