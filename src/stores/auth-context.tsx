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
        
        // Try to refresh user data from server
        try {
          const freshUserData = await authService.getProfile();
          setUser(freshUserData);
          
          // Join WebSocket room for restaurant if user has one
          if (freshUserData.restaurant_id) {
            websocketService.joinRestaurant(freshUserData.restaurant_id);
          }
        } catch (error) {
          console.warn('Failed to refresh user data:', error);
          // Keep using stored user data if refresh fails
          if (storedUser.restaurant_id) {
            websocketService.joinRestaurant(storedUser.restaurant_id);
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      // Clear invalid auth data
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const authResponse = await authService.login({ email, password });
      setUser(authResponse.user);
      
      // Join WebSocket room for restaurant if user has one
      if (authResponse.user.restaurant_id) {
        websocketService.joinRestaurant(authResponse.user.restaurant_id);
      }
      
      // Reconnect WebSocket with new token
      websocketService.reconnect();
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
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails due to auth error, logout
      if (error instanceof Error && error.message.includes('401')) {
        await logout();
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