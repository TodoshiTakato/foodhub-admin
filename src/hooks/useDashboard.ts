import { useQuery } from 'react-query';
import { dashboardService } from '../services/dashboard.service';

export const useDashboardStats = (params?: {
  period?: 'today' | 'week' | 'month' | 'year';
  date_from?: string;
  date_to?: string;
}) => {
  return useQuery(
    ['dashboard', 'stats', params],
    () => dashboardService.getDashboardStats(params),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      staleTime: 15000, // Consider data stale after 15 seconds
      retry: (failureCount, error: any) => {
        // Don't retry for database errors (500 errors with SQL messages)
        if (error?.response?.status === 500 && error?.response?.data?.message?.includes('SQLSTATE')) {
          console.warn('Database error detected, stopping retries:', error?.response?.data?.message);
          return false;
        }
        return failureCount < 3;
      },
    }
  );
};

export const useRevenueAnalytics = (params?: {
  period?: 'daily' | 'weekly' | 'monthly';
  date_from?: string;
  date_to?: string;
}) => {
  return useQuery(
    ['dashboard', 'revenue', params],
    () => dashboardService.getRevenueAnalytics(params),
    {
      refetchInterval: 60000, // Refresh every minute
      staleTime: 30000,
    }
  );
};

export const useOrdersAnalytics = (params?: {
  period?: 'today' | 'week' | 'month';
  date_from?: string;
  date_to?: string;
}) => {
  return useQuery(
    ['dashboard', 'orders', params],
    () => dashboardService.getOrdersAnalytics(params),
    {
      refetchInterval: 30000,
      staleTime: 15000,
    }
  );
};

export const useTopProducts = (params?: {
  period?: 'week' | 'month' | 'year';
  limit?: number;
}) => {
  return useQuery(
    ['dashboard', 'top-products', params],
    () => dashboardService.getTopProducts(params),
    {
      refetchInterval: 300000, // Refresh every 5 minutes
      staleTime: 120000, // 2 minutes
    }
  );
}; 