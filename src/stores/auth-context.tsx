import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/api';
import { authService } from '../services/auth.service';
import { websocketService } from '../services/websocket.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const storedUser = authService.getStoredUser();
      const token = authService.getStoredToken();

      if (storedUser && token) {
        setUser(storedUser);
        
        // Подключаем WebSocket только для авторизованных пользователей
        websocketService.connect();
        
        // Try to refresh user data from server with better error handling
        try {
          const freshUserData = await authService.getProfile();
          setUser(freshUserData);
          
          // Join WebSocket room for restaurant if user has one
          if (freshUserData.restaurant_id) {
            websocketService.joinRestaurant(freshUserData.restaurant_id);
          }
        } catch (error: any) {
          console.error('Failed to refresh user data:', error);
          
          // If it's an auth error (401/403), logout
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            console.log('Auth token invalid, logging out...');
            await logout();
            return;
          }
          
          // For other errors (500, network), keep using stored user data
          console.warn('Server error, using cached user data:', error);
          if (storedUser.restaurant_id) {
            websocketService.joinRestaurant(storedUser.restaurant_id);
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      // Clear invalid auth data only for auth errors
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
      await logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const authResponse = await authService.login({ email, password });
      setUser(authResponse.user);
      
      // Подключаем WebSocket после успешной авторизации
      websocketService.connect();
      
      // Join WebSocket room for restaurant if user has one
      if (authResponse.user.restaurant_id) {
        websocketService.joinRestaurant(authResponse.user.restaurant_id);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Leave WebSocket room if user has restaurant
      if (user?.restaurant_id) {
        websocketService.leaveRestaurant(user.restaurant_id);
      }
      
      // Disconnect WebSocket
      websocketService.disconnect();
      
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (authService.isAuthenticated()) {
        const freshUserData = await authService.getProfile();
        setUser(freshUserData);
      }
    } catch (error: any) {
      console.error('Failed to refresh user:', error);
      
      // If refresh fails due to auth error, logout
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.log('Auth error during refresh, logging out...');
        await logout();
        return;
      }
      
      // For server errors, don't logout - just log the error
      if (error?.response?.status >= 500) {
        console.log('Server error during refresh, keeping current session');
        return;
      }
      
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && authService.isAuthenticated(),
    isLoading,
    login,
    logout,
    updateUser,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 