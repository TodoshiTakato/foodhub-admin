import React from 'react';
import Card from '../../components/common/Card';

const OrdersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600">Manage and track all restaurant orders</p>
      </div>

      <Card>
        <div className="p-6">
          <p className="text-gray-500">Orders management interface will be implemented here</p>
        </div>
      </Card>
    </div>
  );
};

export default OrdersPage; 