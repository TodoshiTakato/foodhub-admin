import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Menu, 
  Settings,
  Users,
  UserCog
} from 'lucide-react';
import { useAuth } from '../../stores/auth-context';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  roles?: string[];
}

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navigationItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Orders',
      href: '/orders',
      icon: ShoppingBag,
    },
    {
      name: 'Products',
      href: '/products',
      icon: Package,
    },
    {
      name: 'Menus',
      href: '/menus',
      icon: Menu,
    },
    {
      name: 'Users',
      href: '/users',
      icon: UserCog,
      roles: ['super-admin', 'admin', 'restaurant-owner'], // Только эти роли могут управлять пользователями
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  // Filter navigation based on user role
  const filteredNavigation = navigationItems.filter(item => {
    // Если у пункта меню есть ограничения по ролям
    if (item.roles && user?.role) {
      return item.roles.includes(user.role);
    }
    
    // Для kitchen-staff показываем только Dashboard и Orders
    if (user?.role === 'kitchen-staff') {
      return ['Dashboard', 'Orders'].includes(item.name);
    }
    
    return true; // Для остальных ролей показываем все пункты без ограничений
  });

  return (
    <div className="bg-white w-64 shadow-sm border-r border-gray-200">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FH</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">FoodHub</span>
        </div>
      </div>

      <nav className="mt-6">
        <div className="px-6 space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* User info */}
      <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
            <Users className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 