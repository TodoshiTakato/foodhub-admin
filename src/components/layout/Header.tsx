import React from 'react';
import { LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../stores/auth-context';
import NotificationCenter from '../common/NotificationCenter';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">FoodHub Admin</h1>
            <p className="text-sm text-gray-600">Restaurant Management Dashboard</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notification Center */}
            <NotificationCenter />
            
            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <Settings className="h-5 w-5" />
                </button>
                
                <button 
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-500"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 