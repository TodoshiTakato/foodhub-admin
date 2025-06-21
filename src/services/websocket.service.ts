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
  private ordersChannel: any = null;

  constructor() {
    console.log('🔌 WebSocket service initialized (not connected until login)');
    // Не подключаемся автоматически - только после авторизации
  }

  connect() {
    try {
      // Конфигурация для подключения к Soketi с правильными настройками
      console.log('🔌 Attempting to connect to:', {
        host: import.meta.env.VITE_PUSHER_HOST || 'localhost',
        port: import.meta.env.VITE_PUSHER_PORT || '6001',
        key: import.meta.env.VITE_PUSHER_APP_KEY || 'app-key'
      });

      this.pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY || 'app-key', {
        wsHost: import.meta.env.VITE_PUSHER_HOST || 'localhost',
        wsPort: parseInt(import.meta.env.VITE_PUSHER_PORT) || 6001,
        wssPort: parseInt(import.meta.env.VITE_PUSHER_PORT) || 6001,
        forceTLS: false,
        enabledTransports: ['ws'],
        cluster: '',
        // Настройки для стабильности
        disableStats: true,
        // Временно убираем авторизацию для тестирования
        // authEndpoint: '/broadcasting/auth',
        // auth: {
        //   headers: {
        //     'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || '')
        //   }
        // }
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

      // Добавляем обработчик состояний подключения
      this.pusher.connection.bind('state_change', (states: any) => {
        console.log(`🔄 WebSocket state: ${states.previous} → ${states.current}`);
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
      // Временно используем публичные каналы для тестирования (без private-)
      this.restaurantChannel = this.pusher.subscribe(`restaurant.${restaurantId}`);
      this.ordersChannel = this.pusher.subscribe('orders');
      
      // Слушаем события заказов с правильными названиями от бэкенда
      this.restaurantChannel.bind('order.created', (data: any) => {
        console.log('📦 New order received:', data);
        this.emit('new_order', data.order);  // передаем data.order, не data
        toast.success(`🆕 New order #${data.order.order_number}`);
      });

      this.restaurantChannel.bind('order.status.changed', (data: any) => {
        console.log('📝 Order status changed:', data);
        this.emit('order_status_changed', data);
        toast(`📝 Order #${data.order.order_number}: ${data.order.old_status} → ${data.order.new_status}`);
      });

      this.restaurantChannel.bind('kitchen_update', (data: any) => {
        console.log('👨‍🍳 Kitchen update:', data);
        this.emit('kitchen_update', data);
        toast(`👨‍🍳 ${data.message}`);
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

      // Подписываемся также на общий канал заказов
      this.ordersChannel.bind('order.created', (data: any) => {
        console.log('📦 Order created (general channel):', data);
        this.emit('new_order', data.order);
      });
      
      this.ordersChannel.bind('order.status.changed', (data: any) => {
        console.log('📝 Order status changed (general channel):', data);
        this.emit('order_status_changed', data);
      });

      console.log(`🏠 Joined restaurant channels: restaurant.${restaurantId}, orders`);
      
    } catch (error) {
      console.error('❌ Failed to join restaurant channels:', error);
    }
  }

  leaveRestaurant(restaurantId: number) {
    if (this.restaurantChannel) {
      this.pusher?.unsubscribe(`restaurant.${restaurantId}`);
      this.restaurantChannel = null;
      console.log(`🚪 Left restaurant channel: restaurant.${restaurantId}`);
    }
    if (this.ordersChannel) {
      this.pusher?.unsubscribe('orders');
      this.ordersChannel = null;
      console.log(`🚪 Left orders channel: orders`);
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
    this.ordersChannel = null;
    console.log('🔌 WebSocket disconnected');
    // Убираем toast отсюда - он уже показывается в connection.bind('disconnected')
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

  // Тестирование подписки на каналы
  testChannelSubscription() {
    if (!this.pusher || !this.connected) {
      console.warn('⚠️ WebSocket not connected, cannot test channels');
      toast.error('WebSocket not connected');
      return;
    }

    // Тестируем подписку на тестовый канал
    const testChannel = this.pusher.subscribe('test-channel');
    
    testChannel.bind('pusher:subscription_succeeded', () => {
      console.log('✅ Successfully subscribed to test-channel');
      toast.success('🎯 Test channel subscription successful!');
    });

    testChannel.bind('pusher:subscription_error', (error: any) => {
      console.error('❌ Failed to subscribe to test-channel:', error);
      toast.error('🎯 Test channel subscription failed!');
    });

    // Отписываемся через 5 секунд
    setTimeout(() => {
      this.pusher?.unsubscribe('test-channel');
      console.log('🚪 Unsubscribed from test-channel');
    }, 5000);
  }
}

export const websocketService = new WebSocketService(); 