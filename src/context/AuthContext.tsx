import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserSettings } from '../types';
import { loginWithEmail, logout as firebaseLogout, onAuthChange, isFirebaseEnabled } from '../services/firebase';

const adminAllowlist = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

export const authMode: 'firebase' | 'pin' = isFirebaseEnabled ? 'firebase' : 'pin';

export const computeRole = (email?: string): 'ADMIN' | 'STUDENT' => {
  if (!email) return 'STUDENT';
  const normalized = email.toLowerCase();
  if (adminAllowlist.includes(normalized) || normalized.includes('admin')) {
    return 'ADMIN';
  }
  return 'STUDENT';
};

const userSettingsKey = (userId: string) => `eduhub_settings_${userId}`;

export const getUserSettings = (userId: string): UserSettings => {
  try {
    const stored = localStorage.getItem(userSettingsKey(userId));
    if (stored) return JSON.parse(stored) as UserSettings;
  } catch (error) {
    console.error('Failed to parse settings', error);
  }
  return { aiEnabled: false };
};

export const saveUserSettings = (userId: string, settings: UserSettings) => {
  localStorage.setItem(userSettingsKey(userId), JSON.stringify(settings));
};

interface AuthContextType {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  updateSettings: (s: UserSettings) => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, login: () => {}, logout: () => {}, updateSettings: () => {} });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (authMode === 'firebase') {
      const unsub = onAuthChange((firebaseUser) => {
        if (!firebaseUser) {
          setUser(null);
          return;
        }
        const role = computeRole(firebaseUser.email || '');
        const settings = getUserSettings(firebaseUser.uid);
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          role,
          settings,
        });
      });
      return () => unsub();
    } else {
      const stored = localStorage.getItem('eduhub_current_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (error) {
          console.error('Failed to parse user from storage', error);
          localStorage.removeItem('eduhub_current_user');
        }
      }
    }
  }, []);

  const login = (u: User) => {
    setUser(u);
    if (authMode === 'pin') {
      localStorage.setItem('eduhub_current_user', JSON.stringify(u));
    }
  };

  const logout = () => {
    if (authMode === 'firebase') {
      firebaseLogout();
    }
    if (authMode === 'pin') {
      localStorage.removeItem('eduhub_current_user');
    }
    setUser(null);
  };

  const updateSettings = (s: UserSettings) => {
    if (user) {
      const updatedUser = { ...user, settings: s };
      setUser(updatedUser);
      saveUserSettings(user.id, s);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateSettings }}>
      {children}
    </AuthContext.Provider>
  );
};
