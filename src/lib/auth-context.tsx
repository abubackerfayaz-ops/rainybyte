'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface SavedLocation {
  name: string;
  lat: number;
  lon: number;
}

interface ClimateRecord {
  location: string;
  lat: number;
  lon: number;
  condition: string;
  temp: number;
  humidity: number;
  date: string;
}

interface UserData {
  id: string;
  username: string;
  email: string;
  initials: string;
  savedLocations: SavedLocation[];
  preferences: { unit: 'C' | 'F'; notifications: boolean; defaultLocation: string };
  climateRecords: ClimateRecord[];
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  signup: (username: string, email: string, password: string) => Promise<string | null>;
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signup: async () => null,
  login: async () => null,
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        localStorage.removeItem('rainy_byte_token');
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('rainy_byte_token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const signup = async (username: string, email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || 'Signup failed';
      localStorage.setItem('rainy_byte_token', data.token);
      setUser(data.user);
      return null;
    } catch {
      return 'Network error';
    }
  };

  const login = async (username: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || 'Login failed';
      localStorage.setItem('rainy_byte_token', data.token);
      setUser(data.user);
      return null;
    } catch {
      return 'Network error';
    }
  };

  const logout = () => {
    localStorage.removeItem('rainy_byte_token');
    setUser(null);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('rainy_byte_token');
    if (token) await fetchUser(token);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
