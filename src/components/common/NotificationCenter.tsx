import React, { useEffect, useState } from 'react';
import { Bell, Check, X, Clock, AlertCircle } from 'lucide-react';
import { websocketService, WebSocketEvents } from '../../services/websocket.service';
import { Order } from '../../types/api';

interface Notification {
  id: string;
  type: 'new_order' | 'order_status' | 'kitchen_update' | 'general';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // WebSocket event listeners
    const handleNewOrder = (order: Order) => {
      addNotification({
        type: 'new_order',
        title: 'New Order Received',
        message: `Order #${order.order_number} from ${order.customer_name}`,
        data: order
      });
    };

    const handleOrderStatusChanged: WebSocketEvents['order_status_changed'] = (data) => {
      addNotification({
        type: 'order_status',
        title: 'Order Status Updated',
        message: `Order #${data.order.order_number} is now ${data.status}`,
        data: data
      });
    };

    const handleKitchenUpdate: WebSocketEvents['kitchen_update'] = (data) => {
      addNotification({
        type: 'kitchen_update',
        title: 'Kitchen Update',
        message: data.message,
        data: data
      });
    };

    const handleNotification: WebSocketEvents['notification'] = (data) => {
      addNotification({
        type: 'general',
        title: 'System Notification',
        message: data.message,
        data: data
      });
    };

    // Subscribe to WebSocket events
    websocketService.on('new_order', handleNewOrder);
    websocketService.on('order_status_changed', handleOrderStatusChanged);
    websocketService.on('kitchen_update', handleKitchenUpdate);
    websocketService.on('notification', handleNotification);

    // Cleanup on unmount
    return () => {
      websocketService.off('new_order', handleNewOrder);
      websocketService.off('order_status_changed', handleOrderStatusChanged);
      websocketService.off('kitchen_update', handleKitchenUpdate);
      websocketService.off('notification', handleNotification);
    };
  }, []);

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep only last 50
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const clearNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_order':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'order_status':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'kitchen_update':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs font-medium text-white flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <button
                            onClick={() => clearNotification(notification.id)}
                            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-primary-600 hover:text-primary-700"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Connection Status */}
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full bg-green-500`} />
                <span className="text-xs text-gray-600">
                  WebSocket connected to Soketi
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter; 