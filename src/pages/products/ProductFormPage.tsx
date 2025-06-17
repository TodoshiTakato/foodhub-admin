import React from 'react';
import Card from '../../components/common/Card';

const ProductFormPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Product Form</h1>
        <p className="text-gray-600">Create or edit product information</p>
      </div>

      <Card>
        <div className="p-6">
          <p className="text-gray-500">Product form will be implemented here</p>
        </div>
      </Card>
    </div>
  );
};

export default ProductFormPage; 