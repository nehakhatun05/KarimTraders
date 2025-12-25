import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem, User, Address, Notification } from '@/types';

// Cart Store
interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isSyncing: boolean;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
  getDeliveryCharge: () => number;
  getTotal: () => number;
  setItems: (items: CartItem[]) => void;
  setSyncing: (syncing: boolean) => void;
  syncAddItem: (product: Product, quantity: number, userId?: string) => Promise<boolean>;
  syncUpdateQuantity: (productId: string, quantity: number, userId?: string) => Promise<boolean>;
  syncRemoveItem: (productId: string, userId?: string) => Promise<boolean>;
  syncClearCart: (userId?: string) => Promise<boolean>;
  loadFromDatabase: (userId: string) => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isSyncing: false,
      
      setItems: (items) => set({ items }),
      setSyncing: (syncing) => set({ isSyncing: syncing }),
      
      addItem: (product, quantity) => {
        set((state) => {
          const existingItem = state.items.find(item => item.product.id === product.id);
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return {
            items: [...state.items, { product, quantity, selectedUnit: product.unit }],
          };
        });
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.product.id !== productId),
        }));
      },
      
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map(item =>
            item.product.id === productId
              ? { ...item, quantity: Math.max(0, quantity) }
              : item
          ).filter(item => item.quantity > 0),
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
      
      getDeliveryCharge: () => {
        const subtotal = get().getSubtotal();
        return subtotal >= 500 ? 0 : 40;
      },
      
      getTotal: () => {
        return get().getSubtotal() + get().getDeliveryCharge();
      },
      
      // Database sync methods
      syncAddItem: async (product, quantity, userId) => {
        if (!userId) {
          get().addItem(product, quantity);
          return true;
        }
        
        try {
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id, quantity }),
          });
          
          if (res.ok) {
            get().addItem(product, quantity);
            return true;
          }
          return false;
        } catch (error) {
          console.error('Sync add item error:', error);
          return false;
        }
      },
      
      syncUpdateQuantity: async (productId, quantity, userId) => {
        if (!userId) {
          get().updateQuantity(productId, quantity);
          return true;
        }
        
        try {
          const res = await fetch('/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity }),
          });
          
          if (res.ok) {
            get().updateQuantity(productId, quantity);
            return true;
          }
          return false;
        } catch (error) {
          console.error('Sync update quantity error:', error);
          return false;
        }
      },
      
      syncRemoveItem: async (productId, userId) => {
        if (!userId) {
          get().removeItem(productId);
          return true;
        }
        
        try {
          const res = await fetch('/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity: 0 }),
          });
          
          if (res.ok) {
            get().removeItem(productId);
            return true;
          }
          return false;
        } catch (error) {
          console.error('Sync remove item error:', error);
          return false;
        }
      },
      
      syncClearCart: async (userId) => {
        if (!userId) {
          get().clearCart();
          return true;
        }
        
        try {
          const res = await fetch('/api/cart', {
            method: 'DELETE',
          });
          
          if (res.ok) {
            get().clearCart();
            return true;
          }
          return false;
        } catch (error) {
          console.error('Sync clear cart error:', error);
          return false;
        }
      },
      
      loadFromDatabase: async (userId) => {
        if (!userId) return;
        
        set({ isSyncing: true });
        try {
          const res = await fetch('/api/cart');
          if (res.ok) {
            const data = await res.json();
            const dbItems = data.items || [];
            
            // Transform database items to cart items
            const transformedItems: CartItem[] = dbItems.map((item: any) => ({
              product: {
                id: item.product.id,
                name: item.product.name,
                slug: item.product.slug,
                price: Number(item.product.price),
                originalPrice: item.product.originalPrice ? Number(item.product.originalPrice) : Number(item.product.price),
                discount: item.product.discount || 0,
                unit: item.product.unit,
                images: item.product.images?.map((img: any) => img.url) || [],
                category: item.product.category?.name || '',
                stockCount: item.product.stockCount,
                stockStatus: item.product.stockStatus,
                rating: item.product.rating || 0,
                reviewCount: item.product.reviewCount || 0,
              },
              quantity: item.quantity,
              selectedUnit: item.product.unit,
            }));
            
            // Merge with local items
            const localItems = get().items;
            const merged = new Map();
            
            transformedItems.forEach((item: CartItem) => {
              merged.set(item.product.id, item);
            });
            
            // Add local items that aren't in database
            for (const item of localItems) {
              if (!merged.has(item.product.id)) {
                merged.set(item.product.id, item);
                // Sync to database
                await fetch('/api/cart', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ productId: item.product.id, quantity: item.quantity }),
                });
              }
            }
            
            set({ items: Array.from(merged.values()) });
          }
        } catch (error) {
          console.error('Load from database error:', error);
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: 'karim-cart',
    }
  )
);

// Wishlist Store
interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        set((state) => {
          if (state.items.find(item => item.id === product.id)) {
            return state;
          }
          return { items: [...state.items, product] };
        });
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== productId),
        }));
      },
      
      isInWishlist: (productId) => {
        return get().items.some(item => item.id === productId);
      },
      
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'karim-wishlist',
    }
  )
);

// User Store
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  addresses: Address[];
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  addAddress: (address: Address) => void;
  updateAddress: (addressId: string, updates: Partial<Address>) => void;
  removeAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      addresses: [],
      
      login: (user) => {
        set({ user, isAuthenticated: true, addresses: user.addresses });
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false, addresses: [] });
      },
      
      updateProfile: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },
      
      addAddress: (address) => {
        set((state) => ({
          addresses: [...state.addresses, address],
        }));
      },
      
      updateAddress: (addressId, updates) => {
        set((state) => ({
          addresses: state.addresses.map(addr =>
            addr.id === addressId ? { ...addr, ...updates } : addr
          ),
        }));
      },
      
      removeAddress: (addressId) => {
        set((state) => ({
          addresses: state.addresses.filter(addr => addr.id !== addressId),
        }));
      },
      
      setDefaultAddress: (addressId) => {
        set((state) => ({
          addresses: state.addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === addressId,
          })),
        }));
      },
    }),
    {
      name: 'karim-user',
    }
  )
);

// Search Store
interface SearchState {
  query: string;
  recentSearches: string[];
  isOpen: boolean;
  setQuery: (query: string) => void;
  addRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;
  toggleSearch: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      query: '',
      recentSearches: [],
      isOpen: false,
      
      setQuery: (query) => set({ query }),
      
      addRecentSearch: (search) => {
        set((state) => {
          const filtered = state.recentSearches.filter(s => s !== search);
          return {
            recentSearches: [search, ...filtered].slice(0, 10),
          };
        });
      },
      
      clearRecentSearches: () => set({ recentSearches: [] }),
      
      toggleSearch: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'karim-search',
    }
  )
);

// Notification Store
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      
      addNotification: (notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },
      
      markAsRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },
      
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));
      },
      
      clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
    }),
    {
      name: 'karim-notifications',
    }
  )
);

// UI Store
interface UIState {
  isMobileMenuOpen: boolean;
  isFilterOpen: boolean;
  viewMode: 'grid' | 'list';
  toggleMobileMenu: () => void;
  toggleFilter: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isFilterOpen: false,
  viewMode: 'grid',
  
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  toggleFilter: () => set((state) => ({ isFilterOpen: !state.isFilterOpen })),
  setViewMode: (mode) => set({ viewMode: mode }),
}));
