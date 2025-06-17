import { apiService } from './api';
import { 
  Product, 
  Category,
  ProductTranslation,
  Channel,
  ApiResponse, 
  PaginatedResponse 
} from '../types/api';

class ProductsService {
  // Get products with pagination and filters
  async getProducts(params?: {
    page?: number;
    per_page?: number;
    category_id?: number;
    status?: string;
    channel_id?: number;
    search?: string;
  }): Promise<PaginatedResponse<Product>> {
    const response = await apiService.get<ApiResponse<PaginatedResponse<Product>>>('/products', params);
    return response.data;
  }

  // Get single product by ID
  async getProduct(id: number): Promise<Product> {
    const response = await apiService.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  }

  // Create new product
  async createProduct(data: {
    name: string;
    description?: string;
    price: number;
    category_id: number;
    image?: File;
    status: 'active' | 'inactive';
    channels: number[];
    translations?: Omit<ProductTranslation, 'id' | 'product_id'>[];
  }): Promise<Product> {
    if (data.image) {
      return await apiService.upload<ApiResponse<Product>>('/products', data.image, {
        ...data,
        channels: JSON.stringify(data.channels),
        translations: data.translations ? JSON.stringify(data.translations) : undefined,
      }).then(response => response.data);
    } else {
      const response = await apiService.post<ApiResponse<Product>>('/products', data);
      return response.data;
    }
  }

  // Update product
  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    const response = await apiService.put<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data;
  }

  // Update product image
  async updateProductImage(id: number, image: File): Promise<Product> {
    const response = await apiService.upload<ApiResponse<Product>>(`/products/${id}/image`, image);
    return response.data;
  }

  // Delete product
  async deleteProduct(id: number): Promise<void> {
    const response = await apiService.delete<ApiResponse<void>>(`/products/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Product deletion failed');
    }
  }

  // Get product categories
  async getCategories(params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }): Promise<PaginatedResponse<Category>> {
    const response = await apiService.get<ApiResponse<PaginatedResponse<Category>>>('/categories', params);
    return response.data;
  }

  // Create category
  async createCategory(data: {
    name: string;
    description?: string;
    sort_order?: number;
    status: 'active' | 'inactive';
  }): Promise<Category> {
    const response = await apiService.post<ApiResponse<Category>>('/categories', data);
    return response.data;
  }

  // Update category
  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    const response = await apiService.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data;
  }

  // Delete category
  async deleteCategory(id: number): Promise<void> {
    const response = await apiService.delete<ApiResponse<void>>(`/categories/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Category deletion failed');
    }
  }

  // Get available channels
  async getChannels(): Promise<Channel[]> {
    const response = await apiService.get<ApiResponse<Channel[]>>('/channels');
    return response.data;
  }

  // Bulk update products
  async bulkUpdateProducts(productIds: number[], updates: {
    status?: Product['status'];
    category_id?: number;
    channels?: number[];
  }): Promise<void> {
    const response = await apiService.post<ApiResponse<void>>('/products/bulk-update', {
      product_ids: productIds,
      updates
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Bulk update failed');
    }
  }

  // Import products from CSV
  async importProducts(file: File): Promise<{
    success_count: number;
    error_count: number;
    errors: string[];
  }> {
    const response = await apiService.upload<ApiResponse<any>>('/products/import', file);
    return response.data;
  }

  // Export products to CSV
  async exportProducts(params?: {
    category_id?: number;
    status?: string;
    channel_id?: number;
  }): Promise<Blob> {
    const response = await apiService.get('/products/export', params);
    return response as unknown as Blob;
  }

  // Duplicate product
  async duplicateProduct(id: number): Promise<Product> {
    const response = await apiService.post<ApiResponse<Product>>(`/products/${id}/duplicate`);
    return response.data;
  }

  // Get product analytics
  async getProductAnalytics(id: number, params?: {
    period?: 'week' | 'month' | 'year';
    date_from?: string;
    date_to?: string;
  }): Promise<{
    total_orders: number;
    total_revenue: number;
    orders_trend: Array<{ date: string; count: number; revenue: number }>;
  }> {
    const response = await apiService.get<ApiResponse<any>>(`/products/${id}/analytics`, params);
    return response.data;
  }
}

export const productsService = new ProductsService(); 