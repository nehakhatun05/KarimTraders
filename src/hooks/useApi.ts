'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  cartApi,
  ordersApi,
  wishlistApi,
  notificationsApi,
  userApi,
  addressesApi,
  walletApi,
} from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useNotificationStore } from '@/store/notificationStore';

// Cart Hook
export function useCart() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { items, setItems, addItem, updateItem, removeItem, clearCart } = useCartStore();
  const [cartData, setCartData] = useState<any>(null);

  const fetchCart = useCallback(async () => {
    if (!session?.user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await cartApi.get();
      setCartData(data);
      setItems(data.items || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, [session, setItems]);

  const addToCart = async (productId: string, quantity = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const item = await cartApi.add(productId, quantity);
      addItem(item);
      await fetchCart(); // Refresh totals
      return item;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    setLoading(true);
    setError(null);
    
    try {
      if (quantity <= 0) {
        await cartApi.remove(productId);
        removeItem(productId);
      } else {
        await cartApi.update(productId, quantity);
        updateItem(productId, quantity);
      }
      await fetchCart(); // Refresh totals
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await cartApi.remove(productId);
      removeItem(productId);
      await fetchCart(); // Refresh totals
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove from cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const emptyCart = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await cartApi.clear();
      clearCart();
      setCartData(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to clear cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return {
    items,
    cartData,
    loading,
    error,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    emptyCart,
  };
}

// Wishlist Hook
export function useWishlist() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { items, setItems, addItem, removeItem } = useWishlistStore();

  const fetchWishlist = useCallback(async () => {
    if (!session?.user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await wishlistApi.getAll();
      setItems(data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  }, [session, setItems]);

  const addToWishlist = async (productId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const item = await wishlistApi.add(productId);
      addItem(item);
      return item;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add to wishlist');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await wishlistApi.remove(productId);
      removeItem(productId);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove from wishlist');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.productId === productId);
  };

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return {
    items,
    loading,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };
}

// Orders Hook
export function useOrders(params?: { page?: number; status?: string }) {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!session?.user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await ordersApi.getAll(params);
      setOrders(data.orders || []);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [session, params]);

  const cancelOrder = async (orderId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await ordersApi.cancel(orderId);
      await fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    pagination,
    loading,
    error,
    fetchOrders,
    cancelOrder,
  };
}

// Single Order Hook
export function useOrder(orderId: string) {
  const { data: session } = useSession();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!session?.user || !orderId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await ordersApi.getById(orderId);
      setOrder(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  }, [session, orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
  };
}

// Notifications Hook
export function useNotifications() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notifications, unreadCount, setNotifications, setUnreadCount, markAsRead } = useNotificationStore();

  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await notificationsApi.getAll();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [session, setNotifications, setUnreadCount]);

  const markNotificationsAsRead = async (ids?: string[]) => {
    setLoading(true);
    
    try {
      await notificationsApi.markAsRead(ids, !ids);
      if (ids) {
        ids.forEach(id => markAsRead(id));
      } else {
        await fetchNotifications();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to mark as read');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markNotificationsAsRead,
  };
}

// Addresses Hook
export function useAddresses() {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    if (!session?.user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await addressesApi.getAll();
      setAddresses(data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  }, [session]);

  const addAddress = async (data: any) => {
    setLoading(true);
    
    try {
      const address = await addressesApi.create(data);
      setAddresses(prev => [address, ...prev]);
      return address;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add address');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (id: string, data: any) => {
    setLoading(true);
    
    try {
      const address = await addressesApi.update(id, data);
      setAddresses(prev => prev.map(a => a.id === id ? address : a));
      return address;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update address');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id: string) => {
    setLoading(true);
    
    try {
      await addressesApi.delete(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete address');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
  };
}

// Wallet Hook
export function useWallet() {
  const { data: session } = useSession();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async (params?: any) => {
    if (!session?.user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await walletApi.get(params);
      setBalance(Number(data.balance) || 0);
      setTransactions(data.transactions || []);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch wallet');
    } finally {
      setLoading(false);
    }
  }, [session]);

  const addMoney = async (amount: number) => {
    setLoading(true);
    
    try {
      const data = await walletApi.addMoney(amount);
      setBalance(Number(data.balance) || 0);
      await fetchWallet();
      return data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add money');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return {
    balance,
    transactions,
    pagination,
    loading,
    error,
    fetchWallet,
    addMoney,
  };
}

// Profile Hook
export function useProfile() {
  const { data: session, update: updateSession } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!session?.user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await userApi.getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, [session]);

  const updateProfile = async (data: any) => {
    setLoading(true);
    
    try {
      const updated = await userApi.updateProfile(data);
      setProfile((prev: any) => ({ ...prev, ...updated }));
      await updateSession();
      return updated;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    
    try {
      await userApi.changePassword(currentPassword, newPassword);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    changePassword,
  };
}
