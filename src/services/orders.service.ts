import { apiService } from './api';
import { 
  Order, 
  ApiResponse, 
  PaginatedResponse 
} from '../types/api';

class OrdersService {
  // Get orders with pagination and filters
  async getOrders(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    channel?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  }): Promise<PaginatedResponse<Order>> {
    const response = await apiService.get<ApiResponse<PaginatedResponse<Order>>>('/orders', params);
    return response.data;
  }

  // Get single order by ID
  async getOrder(id: number): Promise<Order> {
    const response = await apiService.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  }

  // Update order status
  async updateOrderStatus(id: number, status: Order['status']): Promise<Order> {
    const response = await apiService.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    return response.data;
  }

  // Update order details
  async updateOrder(id: number, data: Partial<Order>): Promise<Order> {
    const response = await apiService.put<ApiResponse<Order>>(`/orders/${id}`, data);
    return response.data;
  }

  // Add note to order
  async addOrderNote(id: number, note: string): Promise<Order> {
    const response = await apiService.post<ApiResponse<Order>>(`/orders/${id}/notes`, { note });
    return response.data;
  }

  // Cancel order
  async cancelOrder(id: number, reason?: string): Promise<Order> {
    const response = await apiService.post<ApiResponse<Order>>(`/orders/${id}/cancel`, { reason });
    return response.data;
  }

  // Refund order
  async refundOrder(id: number, amount?: number, reason?: string): Promise<Order> {
    const response = await apiService.post<ApiResponse<Order>>(`/orders/${id}/refund`, { 
      amount, 
      reason 
    });
    return response.data;
  }

  // Print order receipt
  async printOrder(id: number): Promise<Blob> {
    const response = await apiService.get(`/orders/${id}/print`);
    return response as unknown as Blob;
  }

  // Get order statistics
  async getOrderStats(params?: {
    period?: 'today' | 'week' | 'month' | 'year';
    date_from?: string;
    date_to?: string;
  }): Promise<{
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
    orders_by_status: Record<string, number>;
    orders_by_channel: Record<string, number>;
    hourly_orders: Array<{ hour: number; count: number; revenue: number }>;
  }> {
    const response = await apiService.get<ApiResponse<any>>('/orders/stats', params);
    return response.data;
  }

  // Export orders to CSV
  async exportOrders(params?: {
    status?: string;
    channel?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<Blob> {
    const response = await apiService.get('/orders/export', params);
    return response as unknown as Blob;
  }

  // Bulk update orders
  async bulkUpdateOrders(orderIds: number[], updates: {
    status?: Order['status'];
    channel?: string;
  }): Promise<void> {
    const response = await apiService.post<ApiResponse<void>>('/orders/bulk-update', {
      order_ids: orderIds,
      updates
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Bulk update failed');
    }
  }

  // Search orders
  async searchOrders(query: string): Promise<Order[]> {
    const response = await apiService.get<ApiResponse<Order[]>>('/orders/search', { q: query });
    return response.data;
  }
}

export const ordersService = new OrdersService(); 