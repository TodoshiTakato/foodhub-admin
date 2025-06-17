import React from 'react';
import Card from '../../components/common/Card';

const MenusPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Menus</h1>
        <p className="text-gray-600">Manage restaurant menus and categories</p>
      </div>

      <Card>
        <div className="p-6">
          <p className="text-gray-500">Menu management interface will be implemented here</p>
        </div>
      </Card>
    </div>
  );
};

export default MenusPage; 