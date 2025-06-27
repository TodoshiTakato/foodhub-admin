export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'super-admin' | 'admin' | 'restaurant-owner' | 'restaurant-manager' | 'kitchen-staff' | 'cashier' | 'customer';
  roles?: Array<{
    id: number;
    name: string;
    display_name: string;
  }>;
  restaurant_id?: number;
  restaurant?: Restaurant;
  status: 'active' | 'inactive' | 'suspended';
  last_login_at?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  timezone: string;
  currency: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id: number;
  restaurant_id: number;
  image?: string;
  status: 'active' | 'inactive';
  channels: Channel[];
  translations: ProductTranslation[];
  created_at: string;
  updated_at: string;
}

export interface ProductTranslation {
  id: number;
  product_id: number;
  language: string;
  name: string;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  restaurant_id: number;
  sort_order: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: number;
  name: string;
  type: 'delivery' | 'pickup' | 'dine_in';
  status: 'active' | 'inactive';
  restaurant_id: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  channel: string;
  total: number;
  currency: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  delivery_address?: string;
  notes?: string;
  restaurant_id: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
  notes?: string;
}

export interface Menu {
  id: number;
  name: string;
  description?: string;
  restaurant_id: number;
  status: 'active' | 'inactive';
  channels: Channel[];
  categories: Category[];
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface DashboardStats {
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
  today_revenue: number;
  popular_products: Array<{
    product: Product;
    orders_count: number;
  }>;
  recent_orders: Order[];
} 