import { User } from '../types/api';

export type UserRole = 'super-admin' | 'admin' | 'restaurant-owner' | 'restaurant-manager' | 'kitchen-staff' | 'cashier' | 'customer';

// Иерархия ролей и что они могут создавать
export const ROLE_HIERARCHY: Record<UserRole, {
  canCreate: UserRole[];
  description: string;
  color: string;
  priority: number; // чем меньше число, тем выше роль
}> = {
  'super-admin': {
    canCreate: ['super-admin', 'admin', 'restaurant-owner', 'restaurant-manager', 'kitchen-staff', 'cashier', 'customer'],
    description: '🔥 Полный доступ к системе',
    color: 'bg-red-600 text-white',
    priority: 1,
  },
  'admin': {
    canCreate: ['restaurant-owner', 'restaurant-manager', 'kitchen-staff', 'cashier', 'customer'],
    description: '⚡ Администрирование системы',
    color: 'bg-purple-600 text-white',
    priority: 2,
  },
  'restaurant-owner': {
    canCreate: ['restaurant-manager', 'kitchen-staff', 'cashier', 'customer'],
    description: '👑 Владелец ресторана',
    color: 'bg-green-600 text-white',
    priority: 3,
  },
  'restaurant-manager': {
    canCreate: ['kitchen-staff', 'cashier', 'customer'],
    description: '👨‍💼 Менеджер ресторана',
    color: 'bg-blue-600 text-white',
    priority: 4,
  },
  'kitchen-staff': {
    canCreate: [],
    description: '👨‍🍳 Сотрудник кухни',
    color: 'bg-orange-600 text-white',
    priority: 5,
  },
  'cashier': {
    canCreate: [],
    description: '💰 Кассир',
    color: 'bg-purple-500 text-white',
    priority: 6,
  },
  'customer': {
    canCreate: [],
    description: '👤 Клиент',
    color: 'bg-gray-600 text-white',
    priority: 7,
  },
};

// Статусы пользователей
export const USER_STATUSES = {
  ACTIVE: 'active' as const,
  INACTIVE: 'inactive' as const,
  SUSPENDED: 'suspended' as const,
} as const;

export type UserStatus = typeof USER_STATUSES[keyof typeof USER_STATUSES];

// Цвета для статусов
export const STATUS_COLORS: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800',
};

// Читаемые названия статусов
export const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Активен',
  inactive: 'Неактивен',
  suspended: 'Заблокирован',
};

// Читаемые названия ролей
export const ROLE_LABELS: Record<UserRole, string> = {
  'super-admin': 'Супер Админ',
  'admin': 'Админ',
  'restaurant-owner': 'Владелец',
  'restaurant-manager': 'Менеджер',
  'kitchen-staff': 'Кухня',
  'cashier': 'Кассир',
  'customer': 'Клиент',
};

// Функции для проверки разрешений
export const canUserCreateRole = (currentUserRole: UserRole, targetRole: UserRole): boolean => {
  return ROLE_HIERARCHY[currentUserRole].canCreate.includes(targetRole);
};

export const getAvailableRoles = (currentUserRole: UserRole): UserRole[] => {
  return ROLE_HIERARCHY[currentUserRole].canCreate;
};

export const getRoleDisplayName = (role: UserRole): string => {
  return ROLE_LABELS[role] || role;
};

export const getRoleDescription = (role: UserRole): string => {
  return ROLE_HIERARCHY[role].description;
};

export const getRoleColor = (role: UserRole): string => {
  return ROLE_HIERARCHY[role].color;
};

export const getStatusColor = (status: UserStatus): string => {
  return STATUS_COLORS[status];
};

export const getStatusLabel = (status: UserStatus): string => {
  return STATUS_LABELS[status];
};

// Проверка является ли роль системной (требует особых разрешений)
export const isSystemRole = (role: UserRole): boolean => {
  return ['super-admin', 'admin'].includes(role);
};

// Проверка требует ли роль ресторан
export const roleRequiresRestaurant = (role: UserRole): boolean => {
  return ['restaurant-owner', 'restaurant-manager', 'kitchen-staff', 'cashier'].includes(role);
};

// Получить главную роль пользователя (если их несколько)
export const getUserPrimaryRole = (user: User): UserRole => {
  if (user.roles && user.roles.length > 0) {
    // Сортируем роли по приоритету и берем самую высокую
    const sortedRoles = user.roles
      .map(r => r.name as UserRole)
      .filter(role => Object.keys(ROLE_HIERARCHY).includes(role))
      .sort((a, b) => ROLE_HIERARCHY[a].priority - ROLE_HIERARCHY[b].priority);
    
    return sortedRoles[0] || user.role;
  }
  return user.role;
};

// Проверка может ли пользователь редактировать другого пользователя
export const canEditUser = (currentUser: User, targetUser: User): boolean => {
  const currentRole = getUserPrimaryRole(currentUser);
  const targetRole = getUserPrimaryRole(targetUser);
  
  // Нельзя редактировать самого себя через этот интерфейс
  if (currentUser.id === targetUser.id) return false;
  
  // Супер-админ может редактировать всех
  if (currentRole === 'super-admin') return true;
  
  // Проверяем по иерархии
  return ROLE_HIERARCHY[currentRole].priority < ROLE_HIERARCHY[targetRole].priority;
};

// Проверка может ли пользователь удалить другого пользователя
export const canDeleteUser = (currentUser: User, targetUser: User): boolean => {
  // Те же правила что и для редактирования
  return canEditUser(currentUser, targetUser);
};

// Фильтрация ролей для формы создания пользователя
export const getCreateUserRoleOptions = (currentUserRole: UserRole) => {
  return getAvailableRoles(currentUserRole).map(role => ({
    value: role,
    label: getRoleDisplayName(role),
    description: getRoleDescription(role),
    color: getRoleColor(role),
    requiresRestaurant: roleRequiresRestaurant(role),
  }));
}; 