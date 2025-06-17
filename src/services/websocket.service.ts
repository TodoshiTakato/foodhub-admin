import toast from 'react-hot-toast';
import Pusher from 'pusher-js';
import { Order } from '../types/api';

export interface WebSocketEvents {
  new_order: (order: Order) => void;
  order_status_changed: (data: { order_id: number; status: Order['status']; order: Order }) => void;
  kitchen_update: (data: { order_id: number; message: string }) => void;
  notification: (data: { type: 'info' | 'success' | 'warning' | 'error'; message: string }) => void;
}

class WebSocketService {
  private pusher: Pusher | null = null;
  private eventHandlers: Map<keyof WebSocketEvents, Function[]> = new Map();
  private connected = false;
  private restaurantChannel: any = null;

  constructor() {
    console.log('🔌 WebSocket service initialized with Soketi/Pusher');
    this.connect();
  }

  private connect() {
    try {
      // Конфигурация для подключения к Soketi
      this.pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY || 'foodhub-app', {
        wsHost: import.meta.env.VITE_PUSHER_HOST || 'localhost',
        wsPort: parseInt(import.meta.env.VITE_PUSHER_PORT) || 6001,
        wssPort: parseInt(import.meta.env.VITE_PUSHER_PORT) || 6001,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        cluster: '',
      });

      this.pusher.connection.bind('connected', () => {
        this.connected = true;
        console.log('✅ Connected to Soketi WebSocket server');
        toast.success('🔌 WebSocket connected');
      });

      this.pusher.connection.bind('disconnected', () => {
        this.connected = false;
        console.log('❌ Disconnected from Soketi');
        toast.error('🔌 WebSocket disconnected');
      });

      this.pusher.connection.bind('error', (error: any) => {
        console.error('❌ Soketi connection error:', error);
        toast.error('🔌 WebSocket connection error');
      });

    } catch (error) {
      console.error('❌ Failed to initialize Pusher client:', error);
      toast.error('🔌 Failed to initialize WebSocket');
    }
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
    if (handlers && handlers.length > 0) {
      handlers.forEach(handler => {
        try {
          (handler as any)(...args);
        } catch (error) {
          console.error(`WebSocket ${event} handler error:`, error);
        }
      });
    }
  }

  // Join/leave rooms for specific restaurant
  joinRestaurant(restaurantId: number) {
    if (!this.pusher) return;

    try {
      // Подписываемся на канал ресторана
      this.restaurantChannel = this.pusher.subscribe(`restaurant.${restaurantId}`);
      
      // Слушаем события заказов
      this.restaurantChannel.bind('new_order', (data: Order) => {
        console.log('📦 New order received:', data);
        this.emit('new_order', data);
        toast.success(`🆕 New order #${data.order_number}`);
      });

      this.restaurantChannel.bind('order_status_changed', (data: any) => {
        console.log('📝 Order status changed:', data);
        this.emit('order_status_changed', data);
        toast.info(`📝 Order #${data.order.order_number} is now ${data.status}`);
      });

      this.restaurantChannel.bind('kitchen_update', (data: any) => {
        console.log('👨‍🍳 Kitchen update:', data);
        this.emit('kitchen_update', data);
        toast.info(`👨‍🍳 ${data.message}`);
      });

      this.restaurantChannel.bind('notification', (data: any) => {
        console.log('🔔 Notification:', data);
        this.emit('notification', data);
        
        switch (data.type) {
          case 'success': toast.success(data.message); break;
          case 'error': toast.error(data.message); break;
          case 'warning': toast.error(data.message, { icon: '⚠️' }); break;
          default: toast(data.message);
        }
      });

      console.log(`🏠 Joined restaurant channel: restaurant.${restaurantId}`);
      
    } catch (error) {
      console.error('❌ Failed to join restaurant channel:', error);
    }
  }

  leaveRestaurant(restaurantId: number) {
    if (this.restaurantChannel) {
      this.pusher?.unsubscribe(`restaurant.${restaurantId}`);
      this.restaurantChannel = null;
      console.log(`🚪 Left restaurant channel: restaurant.${restaurantId}`);
    }
  }

  // Send events to server (через HTTP API, не WebSocket)
  updateOrderStatus(orderId: number, status: Order['status']) {
    console.log(`📝 Order ${orderId} status update to ${status} (will be sent via HTTP API)`);
  }

  // Check connection status
  isConnected(): boolean {
    return this.connected;
  }

  // Disconnect
  disconnect() {
    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
    }
    this.connected = false;
    this.eventHandlers.clear();
    this.restaurantChannel = null;
    console.log('🔌 WebSocket disconnected');
  }

  // Reconnect manually
  reconnect() {
    console.log('🔄 WebSocket reconnecting...');
    this.disconnect();
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