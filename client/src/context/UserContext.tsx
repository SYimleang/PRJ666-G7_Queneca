// context/UserContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { IUser } from '../types/user';

type UserContextType = {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  loading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserState(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user', err);
      }
    }
    setLoading(false);
  }, []);

  // When user changes: save to localStorage
  const setUser = (user: IUser | null) => {
    setUserState(user);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
