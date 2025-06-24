import React from 'react';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { useDashboardStats, useTopProducts } from '../../hooks/useDashboard';
import { STATUS_CLASSES } from '../../utils/orderStatus';

const DashboardPage: React.FC = () => {
  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: topProducts, isLoading: productsLoading } = useTopProducts({ limit: 5 });



  // Show loading spinner while main data is loading
  if (statsLoading) {
    return <LoadingSpinner />;
  }

  // Show error state
  if (statsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-red-600">Failed to load dashboard data. Please try again.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Revenue',
      value: `$${dashboardStats?.total_revenue?.toLocaleString() || '0'}`,
      change: '+12.5%',
      icon: DollarSign,
      trend: 'up'
    },
    {
      name: 'Orders Today',
      value: dashboardStats?.total_orders?.toString() || '0',
      change: '+8.2%',
      icon: ShoppingCart,
      trend: 'up'
    },
    {
      name: 'Pending Orders',
      value: dashboardStats?.pending_orders?.toString() || '0',
      change: '-5.4%',
      icon: Users,
      trend: 'down'
    },
    {
      name: 'Today Revenue',
      value: `$${dashboardStats?.today_revenue?.toLocaleString() || '0'}`,
      change: '+15.3%',
      icon: TrendingUp,
      trend: 'up'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your restaurant.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
            <div className="space-y-3">
              {dashboardStats?.recent_orders?.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Order #{order.order_number}</p>
                    <p className="text-xs text-gray-500">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">${order.total}</p>
                    <p className={`text-xs capitalize ${STATUS_CLASSES[order.status]}`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-4">
                  No recent orders
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Top Products</h3>
              {productsLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              )}
            </div>
            <div className="space-y-3">
              {topProducts?.map((product) => (
                <div key={product.product_id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.product_name}</p>
                    <p className="text-xs text-gray-500">{product.orders_count} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">${product.revenue}</p>
                    <div className="flex items-center text-xs">
                      <span className={`${
                        product.trend === 'up' ? 'text-green-600' :
                        product.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {product.trend === 'up' ? '↗' : product.trend === 'down' ? '↘' : '→'}
                      </span>
                    </div>
                  </div>
                </div>
              )) || (
                !productsLoading && (
                  <div className="text-center text-gray-500 py-4">
                    No product data available
                  </div>
                )
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Chart Placeholder */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Revenue chart will be implemented with real-time data</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage; 