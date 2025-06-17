import React from 'react';
import Card from '../../components/common/Card';

const OrderDetailsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
        <p className="text-gray-600">View detailed order information</p>
      </div>

      <Card>
        <div className="p-6">
          <p className="text-gray-500">Order details interface will be implemented here</p>
        </div>
      </Card>
    </div>
  );
};

export default OrderDetailsPage; 