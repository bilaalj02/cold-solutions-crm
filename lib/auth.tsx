'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = () => {
      try {
        const authStatus = localStorage.getItem('cold_solutions_auth');
        const userData = localStorage.getItem('cold_solutions_user');

        if (authStatus === 'true' && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check stored users or default admin
      const storedUsers = JSON.parse(localStorage.getItem('cold_solutions_users') || '[]');
      const defaultUser = { email: 'admin@coldsolutions.com', password: 'admin123', name: 'Admin User', role: 'Admin' };

      // Add default admin if not exists
      if (!storedUsers.find((u: any) => u.email === defaultUser.email)) {
        storedUsers.push(defaultUser);
        localStorage.setItem('cold_solutions_users', JSON.stringify(storedUsers));
      }

      // Find matching user
      const matchedUser = storedUsers.find((u: any) => u.email === email && u.password === password);

      if (matchedUser) {
        const userData = {
          email: matchedUser.email,
          name: matchedUser.name,
          role: matchedUser.role
        };

        localStorage.setItem('cold_solutions_auth', 'true');
        localStorage.setItem('cold_solutions_user', JSON.stringify(userData));
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('cold_solutions_auth');
    localStorage.removeItem('cold_solutions_user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout
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

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: '#3dbff2'}}></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}