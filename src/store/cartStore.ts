import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    unit: string;
    stockCount: number;
    images: { url: string; alt: string }[];
    category: { name: string; slug: string };
  };
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateItem: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Computed
  getItemCount: () => number;
  getSubtotal: () => number;
  getItemById: (productId: string) => CartItem | undefined;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      setItems: (items) => set({ items }),
      
      addItem: (item) => set((state) => {
        const existingIndex = state.items.findIndex(
          (i) => i.productId === item.productId
        );
        
        if (existingIndex >= 0) {
          const newItems = [...state.items];
          newItems[existingIndex] = item;
          return { items: newItems };
        }
        
        return { items: [...state.items, item] };
      }),
      
      updateItem: (productId, quantity) => set((state) => ({
        items: state.items.map((item) =>
          item.productId === productId
            ? { ...item, quantity }
            : item
        ),
      })),
      
      removeItem: (productId) => set((state) => ({
        items: state.items.filter((item) => item.productId !== productId),
      })),
      
      clearCart: () => set({ items: [] }),
      
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      
      getItemCount: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },
      
      getSubtotal: () => {
        const { items } = get();
        return items.reduce(
          (sum, item) => sum + Number(item.product.price) * item.quantity,
          0
        );
      },
      
      getItemById: (productId) => {
        const { items } = get();
        return items.find((item) => item.productId === productId);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
