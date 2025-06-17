import React from 'react';
import Card from '../../components/common/Card';

const ProductsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-600">Manage your restaurant products and menu items</p>
      </div>

      <Card>
        <div className="p-6">
          <p className="text-gray-500">Products management interface will be implemented here</p>
        </div>
      </Card>
    </div>
  );
};

export default ProductsPage; 