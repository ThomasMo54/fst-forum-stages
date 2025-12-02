import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import AuthService, { type DecodedToken } from '../services/auth.service';

interface AuthContextType {
  user: DecodedToken | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      const currentTime = Date.now() / 1000;
      if (currentUser.exp < currentTime) {
        AuthService.logout();
        setUser(null);
      } else {
        setUser(currentUser);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    await AuthService.login(email, password);
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};