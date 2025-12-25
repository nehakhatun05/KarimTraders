import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { getSession } from 'next-auth/react';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.user) {
      config.headers.Authorization = `Bearer ${session.user.id}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  unit: string;
  stockStatus: string;
  stockCount: number;
  images: { url: string; alt: string }[];
  category: { name: string; slug: string };
  rating: number;
  reviewCount: number;
  featured: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  items: any[];
  address: any;
  timeline: any[];
  createdAt: string;
}

// Products API
export const productsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    search?: string;
    featured?: boolean;
  }) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  
  getBySlug: async (slug: string) => {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/products', data);
    return response.data;
  },
  
  update: async (slug: string, data: any) => {
    const response = await api.put(`/products/${slug}`, data);
    return response.data;
  },
  
  delete: async (slug: string) => {
    const response = await api.delete(`/products/${slug}`);
    return response.data;
  },
};

// Categories API
export const categoriesApi = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/categories', data);
    return response.data;
  },
};

// Cart API
export const cartApi = {
  get: async () => {
    const response = await api.get('/cart');
    return response.data;
  },
  
  add: async (productId: string, quantity = 1) => {
    const response = await api.post('/cart', { productId, quantity });
    return response.data;
  },
  
  update: async (productId: string, quantity: number) => {
    const response = await api.put('/cart', { productId, quantity });
    return response.data;
  },
  
  remove: async (productId: string) => {
    const response = await api.delete(`/cart?productId=${productId}`);
    return response.data;
  },
  
  clear: async () => {
    const response = await api.delete('/cart');
    return response.data;
  },
};

// Orders API
export const ordersApi = {
  getAll: async (params?: PaginationParams & { status?: string }) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  
  create: async (data: {
    addressId: string;
    paymentMethod: 'COD' | 'ONLINE' | 'WALLET';
    deliverySlotId?: string;
    notes?: string;
    couponCode?: string;
  }) => {
    const response = await api.post('/orders', data);
    return response.data;
  },
  
  cancel: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};

// User API
export const userApi = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
  
  updateProfile: async (data: { name?: string; phone?: string; image?: string }) => {
    const response = await api.put('/user/profile', data);
    return response.data;
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.patch('/user/profile', { currentPassword, newPassword });
    return response.data;
  },
  
  deleteAccount: async () => {
    const response = await api.delete('/user/profile');
    return response.data;
  },
};

// Addresses API
export const addressesApi = {
  getAll: async () => {
    const response = await api.get('/user/addresses');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/user/addresses/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/user/addresses', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/user/addresses/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/user/addresses/${id}`);
    return response.data;
  },
};

// Wallet API
export const walletApi = {
  get: async (params?: PaginationParams & { type?: string }) => {
    const response = await api.get('/user/wallet', { params });
    return response.data;
  },
  
  addMoney: async (amount: number, paymentId?: string) => {
    const response = await api.post('/user/wallet', { amount, paymentId });
    return response.data;
  },
};

// Wishlist API
export const wishlistApi = {
  getAll: async () => {
    const response = await api.get('/user/wishlist');
    return response.data;
  },
  
  add: async (productId: string) => {
    const response = await api.post('/user/wishlist', { productId });
    return response.data;
  },
  
  remove: async (productId: string) => {
    const response = await api.delete(`/user/wishlist?productId=${productId}`);
    return response.data;
  },
};

// Notifications API
export const notificationsApi = {
  getAll: async (params?: PaginationParams & { unread?: boolean }) => {
    const response = await api.get('/user/notifications', { params });
    return response.data;
  },
  
  markAsRead: async (notificationIds?: string[], markAll = false) => {
    const response = await api.put('/user/notifications', { notificationIds, markAll });
    return response.data;
  },
  
  delete: async (id?: string) => {
    const response = await api.delete(`/user/notifications${id ? `?id=${id}` : ''}`);
    return response.data;
  },
};

// Reviews API
export const reviewsApi = {
  getByProduct: async (productId: string, params?: PaginationParams & { sortBy?: string }) => {
    const response = await api.get('/reviews', { params: { productId, ...params } });
    return response.data;
  },
  
  create: async (data: {
    productId: string;
    rating: number;
    title?: string;
    comment?: string;
    images?: string[];
  }) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },
  
  markHelpful: async (reviewId: string) => {
    const response = await api.put('/reviews', { reviewId });
    return response.data;
  },
};

// Coupons API
export const couponsApi = {
  getAll: async () => {
    const response = await api.get('/coupons');
    return response.data;
  },
  
  validate: async (code: string, subtotal: number) => {
    const response = await api.post('/coupons', { code, subtotal });
    return response.data;
  },
};

// Search API
export const searchApi = {
  search: async (query: string, limit = 10) => {
    const response = await api.get('/search', { params: { q: query, limit } });
    return response.data;
  },
};

// Payments API
export const paymentsApi = {
  create: async (data: {
    amount: number;
    currency?: string;
    provider: 'razorpay' | 'stripe';
    metadata?: any;
  }) => {
    const response = await api.post('/payments', data);
    return response.data;
  },
  
  verify: async (data: any) => {
    const response = await api.put('/payments', data);
    return response.data;
  },
};

// Admin API
export const adminApi = {
  getDashboard: async (period = '7d') => {
    const response = await api.get('/admin/dashboard', { params: { period } });
    return response.data;
  },
  
  getOrders: async (params?: any) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },
  
  getOrder: async (id: string) => {
    const response = await api.get(`/admin/orders/${id}`);
    return response.data;
  },
  
  updateOrder: async (id: string, data: any) => {
    const response = await api.put(`/admin/orders/${id}`, data);
    return response.data;
  },
  
  getUsers: async (params?: any) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  
  updateUserRole: async (userId: string, role: string) => {
    const response = await api.put('/admin/users', { userId, role });
    return response.data;
  },
};

export default api;
