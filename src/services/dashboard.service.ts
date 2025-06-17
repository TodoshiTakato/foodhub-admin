import { apiService } from './api';
import { 
  DashboardStats,
  ApiResponse 
} from '../types/api';

class DashboardService {
  // Get dashboard statistics
  async getDashboardStats(params?: {
    period?: 'today' | 'week' | 'month' | 'year';
    date_from?: string;
    date_to?: string;
  }): Promise<DashboardStats> {
    const response = await apiService.get<ApiResponse<DashboardStats>>('/dashboard/stats', params);
    return response.data;
  }

  // Get revenue analytics
  async getRevenueAnalytics(params?: {
    period?: 'daily' | 'weekly' | 'monthly';
    date_from?: string;
    date_to?: string;
  }): Promise<{
    total_revenue: number;
    previous_period_revenue: number;
    growth_percentage: number;
    revenue_by_period: Array<{
      period: string;
      revenue: number;
      orders_count: number;
    }>;
  }> {
    const response = await apiService.get<ApiResponse<any>>('/dashboard/revenue', params);
    return response.data;
  }

  // Get orders analytics
  async getOrdersAnalytics(params?: {
    period?: 'today' | 'week' | 'month';
    date_from?: string;
    date_to?: string;
  }): Promise<{
    total_orders: number;
    pending_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    orders_by_hour: Array<{
      hour: number;
      count: number;
    }>;
    orders_by_channel: Array<{
      channel: string;
      count: number;
      percentage: number;
    }>;
  }> {
    const response = await apiService.get<ApiResponse<any>>('/dashboard/orders', params);
    return response.data;
  }

  // Get top products
  async getTopProducts(params?: {
    period?: 'week' | 'month' | 'year';
    limit?: number;
  }): Promise<Array<{
    product_id: number;
    product_name: string;
    orders_count: number;
    revenue: number;
    trend: 'up' | 'down' | 'stable';
  }>> {
    const response = await apiService.get<ApiResponse<any>>('/dashboard/top-products', params);
    return response.data;
  }

  // Get customer analytics
  async getCustomerAnalytics(params?: {
    period?: 'month' | 'year';
  }): Promise<{
    total_customers: number;
    new_customers: number;
    returning_customers: number;
    customer_acquisition_trend: Array<{
      period: string;
      new_customers: number;
      returning_customers: number;
    }>;
  }> {
    const response = await apiService.get<ApiResponse<any>>('/dashboard/customers', params);
    return response.data;
  }

  // Get performance metrics
  async getPerformanceMetrics(): Promise<{
    average_preparation_time: number;
    average_delivery_time: number;
    order_fulfillment_rate: number;
    customer_satisfaction: number;
    kitchen_efficiency: number;
  }> {
    const response = await apiService.get<ApiResponse<any>>('/dashboard/performance');
    return response.data;
  }

  // Get real-time stats (live dashboard)
  async getRealTimeStats(): Promise<{
    active_orders: number;
    preparing_orders: number;
    ready_orders: number;
    current_revenue: number;
    online_customers: number;
  }> {
    const response = await apiService.get<ApiResponse<any>>('/dashboard/realtime');
    return response.data;
  }

  // Export dashboard report
  async exportDashboardReport(params: {
    period: 'week' | 'month' | 'year';
    date_from?: string;
    date_to?: string;
    format: 'pdf' | 'excel';
  }): Promise<Blob> {
    const response = await apiService.get('/dashboard/export', params);
    return response as unknown as Blob;
  }
}

export const dashboardService = new DashboardService(); 