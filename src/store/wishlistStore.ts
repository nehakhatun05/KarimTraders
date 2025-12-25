import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    unit: string;
    stockStatus: string;
    images: { url: string; alt: string }[];
    category: { name: string; slug: string };
  };
}

interface WishlistStore {
  items: WishlistItem[];
  
  // Actions
  setItems: (items: WishlistItem[]) => void;
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
  
  // Computed
  isInWishlist: (productId: string) => boolean;
  getItemCount: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      setItems: (items) => set({ items }),
      
      addItem: (item) => set((state) => {
        if (state.items.some((i) => i.productId === item.productId)) {
          return state;
        }
        return { items: [...state.items, item] };
      }),
      
      removeItem: (productId) => set((state) => ({
        items: state.items.filter((item) => item.productId !== productId),
      })),
      
      clearWishlist: () => set({ items: [] }),
      
      isInWishlist: (productId) => {
        const { items } = get();
        return items.some((item) => item.productId === productId);
      },
      
      getItemCount: () => {
        const { items } = get();
        return items.length;
      },
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
