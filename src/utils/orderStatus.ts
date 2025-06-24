import { Order } from '../types/api';

export type OrderStatus = Order['status'];

// Правильные статусы из бэкенда Laravel
export const ORDER_STATUSES = {
  PENDING: 'pending' as const,
  CONFIRMED: 'confirmed' as const,
  PREPARING: 'preparing' as const,
  READY: 'ready' as const,
  OUT_FOR_DELIVERY: 'out_for_delivery' as const,
  DELIVERED: 'delivered' as const, // ← ЗАВЕРШЕННЫЙ заказ
  CANCELLED: 'cancelled' as const,
} as const;

// Читаемые названия статусов
export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Ожидает подтверждения',
  confirmed: 'Подтвержден',
  preparing: 'Готовится',
  ready: 'Готов',
  out_for_delivery: 'В доставке',
  delivered: 'Завершен', // ← ЗАВЕРШЕННЫЙ заказ
  cancelled: 'Отменен',
};

// Цвета для статусов
export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#FFA500',      // Orange
  confirmed: '#4169E1',    // Royal Blue
  preparing: '#FF6347',    // Tomato
  ready: '#32CD32',        // Lime Green
  out_for_delivery: '#9370DB', // Medium Purple
  delivered: '#228B22',    // Forest Green ← ЗАВЕРШЕН
  cancelled: '#DC143C',    // Crimson
};

// Tailwind CSS классы для статусов
export const STATUS_CLASSES: Record<OrderStatus, string> = {
  pending: 'text-blue-600',
  confirmed: 'text-blue-500',
  preparing: 'text-yellow-600',
  ready: 'text-green-500',
  out_for_delivery: 'text-purple-600',
  delivered: 'text-green-600', // ← ЗАВЕРШЕН
  cancelled: 'text-red-600',
};

// Утилиты для проверки статусов
export const isCompletedOrder = (status: OrderStatus): boolean => {
  return status === ORDER_STATUSES.DELIVERED;
};

export const isActiveOrder = (status: OrderStatus): boolean => {
  return ![ORDER_STATUSES.DELIVERED, ORDER_STATUSES.CANCELLED].includes(status as any);
};

export const isCancelledOrder = (status: OrderStatus): boolean => {
  return status === ORDER_STATUSES.CANCELLED;
};

export const canCancelOrder = (status: OrderStatus): boolean => {
  return [
    ORDER_STATUSES.PENDING,
    ORDER_STATUSES.CONFIRMED,
    ORDER_STATUSES.PREPARING
  ].includes(status as any);
};

// Получить следующий статус в процессе выполнения заказа
export const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
  const statusFlow: Record<OrderStatus, OrderStatus | null> = {
    pending: ORDER_STATUSES.CONFIRMED,
    confirmed: ORDER_STATUSES.PREPARING,
    preparing: ORDER_STATUSES.READY,
    ready: ORDER_STATUSES.OUT_FOR_DELIVERY,
    out_for_delivery: ORDER_STATUSES.DELIVERED,
    delivered: null, // Финальный статус
    cancelled: null, // Финальный статус
  };
  
  return statusFlow[currentStatus];
};

// Группировка статусов для фильтров
export const STATUS_GROUPS = {
  ACTIVE: [
    ORDER_STATUSES.PENDING,
    ORDER_STATUSES.CONFIRMED,
    ORDER_STATUSES.PREPARING,
    ORDER_STATUSES.READY,
    ORDER_STATUSES.OUT_FOR_DELIVERY,
  ],
  COMPLETED: [ORDER_STATUSES.DELIVERED], // ← ЗАВЕРШЕННЫЕ
  CANCELLED: [ORDER_STATUSES.CANCELLED],
  ALL: Object.values(ORDER_STATUSES),
} as const; 