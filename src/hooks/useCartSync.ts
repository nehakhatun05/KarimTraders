'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

interface CartSyncOptions {
  syncOnMount?: boolean;
  showToasts?: boolean;
}

export function useCartSync(options: CartSyncOptions = {}) {
  const { syncOnMount = true, showToasts = false } = options;
  const { data: session, status } = useSession();
  const { items, setItems, clearCart } = useCartStore();
  const isInitialSync = useRef(true);
  const isSyncing = useRef(false);

  // Fetch cart from database
  const fetchDatabaseCart = useCallback(async () => {
    if (!session?.user?.id) return null;
    
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        return data.items || [];
      }
    } catch (error) {
      console.error('Error fetching database cart:', error);
    }
    return null;
  }, [session?.user?.id]);

  // Sync local cart items to database
  const syncToDatabase = useCallback(async (localItems: any[]) => {
    if (!session?.user?.id || localItems.length === 0) return;
    
    try {
      // Sync each item to database
      for (const item of localItems) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.productId,
            quantity: item.quantity,
          }),
        });
      }
    } catch (error) {
      console.error('Error syncing to database:', error);
    }
  }, [session?.user?.id]);

  // Merge local and database carts
  const mergeCarts = useCallback((localItems: any[], dbItems: any[]) => {
    const merged = new Map();
    
    // Add database items first
    dbItems.forEach((item: any) => {
      merged.set(item.productId, {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: Number(item.product.price),
          originalPrice: item.product.originalPrice ? Number(item.product.originalPrice) : undefined,
          unit: item.product.unit,
          stockCount: item.product.stockCount,
          images: item.product.images || [],
          category: item.product.category || { name: '', slug: '' },
        },
      });
    });
    
    // Merge local items (add to quantity if exists, or add new)
    localItems.forEach((item: any) => {
      const existing = merged.get(item.productId);
      if (existing) {
        // If item exists in both, take the higher quantity
        existing.quantity = Math.max(existing.quantity, item.quantity);
      } else {
        // If only in local, add it
        merged.set(item.productId, item);
      }
    });
    
    return Array.from(merged.values());
  }, []);

  // Add item to cart with database sync
  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    if (isSyncing.current) return;
    
    try {
      if (session?.user?.id) {
        // Add to database first
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity }),
        });
        
        if (res.ok) {
          const newItem = await res.json();
          // Update local store with the database response
          const existingIndex = items.findIndex(i => i.productId === productId);
          if (existingIndex >= 0) {
            const newItems = [...items];
            newItems[existingIndex] = {
              id: newItem.id,
              productId: newItem.productId,
              quantity: newItem.quantity,
              product: {
                id: newItem.product.id,
                name: newItem.product.name,
                slug: newItem.product.slug,
                price: Number(newItem.product.price),
                originalPrice: newItem.product.originalPrice ? Number(newItem.product.originalPrice) : undefined,
                unit: newItem.product.unit,
                stockCount: newItem.product.stockCount,
                images: newItem.product.images || [],
                category: newItem.product.category || { name: '', slug: '' },
              },
            };
            setItems(newItems);
          } else {
            setItems([...items, {
              id: newItem.id,
              productId: newItem.productId,
              quantity: newItem.quantity,
              product: {
                id: newItem.product.id,
                name: newItem.product.name,
                slug: newItem.product.slug,
                price: Number(newItem.product.price),
                originalPrice: newItem.product.originalPrice ? Number(newItem.product.originalPrice) : undefined,
                unit: newItem.product.unit,
                stockCount: newItem.product.stockCount,
                images: newItem.product.images || [],
                category: newItem.product.category || { name: '', slug: '' },
              },
            }]);
          }
          if (showToasts) toast.success('Added to cart');
          return true;
        } else {
          const error = await res.json();
          if (showToasts) toast.error(error.error || 'Failed to add to cart');
          return false;
        }
      } else {
        // Guest user - just update local store
        // Need to fetch product info first
        const res = await fetch(`/api/products/${productId}`);
        if (res.ok) {
          const product = await res.json();
          const existingIndex = items.findIndex(i => i.productId === productId);
          const newItem = {
            id: `local-${Date.now()}`,
            productId,
            quantity,
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: Number(product.price),
              originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
              unit: product.unit,
              stockCount: product.stockCount,
              images: product.images || [],
              category: product.category || { name: '', slug: '' },
            },
          };
          
          if (existingIndex >= 0) {
            const newItems = [...items];
            newItems[existingIndex].quantity += quantity;
            setItems(newItems);
          } else {
            setItems([...items, newItem]);
          }
          if (showToasts) toast.success('Added to cart');
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      if (showToasts) toast.error('Failed to add to cart');
      return false;
    }
  }, [session?.user?.id, items, setItems, showToasts]);

  // Update cart item quantity with database sync
  const updateCartItem = useCallback(async (productId: string, quantity: number) => {
    if (isSyncing.current) return;
    
    try {
      if (session?.user?.id) {
        const res = await fetch('/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity }),
        });
        
        if (res.ok) {
          if (quantity <= 0) {
            setItems(items.filter(i => i.productId !== productId));
          } else {
            setItems(items.map(i => 
              i.productId === productId ? { ...i, quantity } : i
            ));
          }
          return true;
        } else {
          const error = await res.json();
          if (showToasts) toast.error(error.error || 'Failed to update cart');
          return false;
        }
      } else {
        // Guest user
        if (quantity <= 0) {
          setItems(items.filter(i => i.productId !== productId));
        } else {
          setItems(items.map(i => 
            i.productId === productId ? { ...i, quantity } : i
          ));
        }
        return true;
      }
    } catch (error) {
      console.error('Update cart error:', error);
      if (showToasts) toast.error('Failed to update cart');
      return false;
    }
  }, [session?.user?.id, items, setItems, showToasts]);

  // Remove item from cart with database sync
  const removeFromCart = useCallback(async (productId: string) => {
    return updateCartItem(productId, 0);
  }, [updateCartItem]);

  // Clear entire cart with database sync
  const clearEntireCart = useCallback(async () => {
    if (isSyncing.current) return;
    
    try {
      if (session?.user?.id) {
        await fetch('/api/cart', {
          method: 'DELETE',
        });
      }
      clearCart();
      return true;
    } catch (error) {
      console.error('Clear cart error:', error);
      return false;
    }
  }, [session?.user?.id, clearCart]);

  // Initial sync on mount when user is authenticated
  useEffect(() => {
    if (!syncOnMount || status !== 'authenticated' || !session?.user?.id || !isInitialSync.current) {
      return;
    }
    
    isInitialSync.current = false;
    isSyncing.current = true;
    
    const performSync = async () => {
      try {
        const localItems = items;
        const dbItems = await fetchDatabaseCart();
        
        if (dbItems !== null) {
          if (localItems.length > 0 && dbItems.length === 0) {
            // Only local items exist - sync them to database
            await syncToDatabase(localItems);
          } else if (localItems.length === 0 && dbItems.length > 0) {
            // Only database items exist - use them
            const transformedItems = dbItems.map((item: any) => ({
              id: item.id,
              productId: item.productId,
              quantity: item.quantity,
              product: {
                id: item.product.id,
                name: item.product.name,
                slug: item.product.slug,
                price: Number(item.product.price),
                originalPrice: item.product.originalPrice ? Number(item.product.originalPrice) : undefined,
                unit: item.product.unit,
                stockCount: item.product.stockCount,
                images: item.product.images || [],
                category: item.product.category || { name: '', slug: '' },
              },
            }));
            setItems(transformedItems);
          } else if (localItems.length > 0 && dbItems.length > 0) {
            // Both have items - merge them
            const merged = mergeCarts(localItems, dbItems);
            setItems(merged);
            // Sync merged cart back to database
            await syncToDatabase(merged);
          }
        }
      } catch (error) {
        console.error('Cart sync error:', error);
      } finally {
        isSyncing.current = false;
      }
    };
    
    performSync();
  }, [status, session?.user?.id, syncOnMount]); // Don't include items to avoid infinite loop

  return {
    items,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart: clearEntireCart,
    refreshCart: fetchDatabaseCart,
  };
}
