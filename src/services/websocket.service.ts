import toast from 'react-hot-toast';
import { Order } from '../types/api';

export interface WebSocketEvents {
  new_order: (order: Order) => void;
  order_status_changed: (data: { order_id: number; status: Order['status']; order: Order }) => void;
  kitchen_update: (data: { order_id: number; message: string }) => void;
  notification: (data: { type: 'info' | 'success' | 'warning' | 'error'; message: string }) => void;
}

class WebSocketService {
  private eventHandlers: Map<keyof WebSocketEvents, Function[]> = new Map();
  private connected = false;

  constructor() {
    console.log('🔌 WebSocket service initialized (Pusher/Soketi support pending)');
    // Для совместимости - пока отключаем автоподключение
    // this.connect();
  }

  private connect() {
    // Временно отключено - нужен Pusher клиент вместо Socket.io
    console.warn('⚠️ WebSocket connection disabled - Socket.io is not compatible with Soketi/Pusher');
    console.info('💡 To enable: install pusher-js and replace Socket.io client');
    
    // Эмуляция подключения для демо
    setTimeout(() => {
      console.log('🔌 WebSocket service ready (offline mode)');
    }, 1000);
  }

  // Event handler management
  on<K extends keyof WebSocketEvents>(event: K, handler: WebSocketEvents[K]) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off<K extends keyof WebSocketEvents>(event: K, handler: WebSocketEvents[K]) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit<K extends keyof WebSocketEvents>(event: K, ...args: Parameters<WebSocketEvents[K]>) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          (handler as any)(...args);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }

  // Join/leave rooms for specific restaurant
  joinRestaurant(restaurantId: number) {
    console.log(`🏠 Would join restaurant room: restaurant.${restaurantId} (offline mode)`);
  }

  leaveRestaurant(restaurantId: number) {
    console.log(`🚪 Would leave restaurant room: restaurant.${restaurantId} (offline mode)`);
  }

  // Send events to server
  updateOrderStatus(orderId: number, status: Order['status']) {
    console.log(`📝 Would update order ${orderId} to ${status} (offline mode)`);
  }

  // Check connection status
  isConnected(): boolean {
    return this.connected;
  }

  // Disconnect
  disconnect() {
    this.connected = false;
    this.eventHandlers.clear();
    console.log('🔌 WebSocket disconnected');
  }

  // Reconnect manually
  reconnect() {
    console.log('🔄 WebSocket reconnect requested (offline mode)');
    this.connect();
  }

  // Демо методы для тестирования уведомлений
  simulateNewOrder() {
    const demoOrder: Order = {
      id: Date.now(),
      order_number: `ORD${Date.now()}`,
      customer_name: 'Demo Customer',
      status: 'pending',
      channel: 'delivery',
      total: 45.99,
      currency: 'USD',
      payment_status: 'paid',
      restaurant_id: 1,
      items: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.emit('new_order', demoOrder);
    toast.success('🔔 Demo: New order received!');
  }

  simulateNotification() {
    this.emit('notification', {
      type: 'info',
      message: 'Demo notification from WebSocket service'
    });
  }
}

export const websocketService = new WebSocketService(); 