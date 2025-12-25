'use client';

import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CartSidebar() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  const { 
    items, 
    toggleCart, 
    removeItem, 
    updateQuantity, 
    getSubtotal, 
    getDeliveryCharge, 
    getTotal,
    clearCart,
    syncUpdateQuantity,
    syncRemoveItem,
    syncClearCart
  } = useCartStore();

  const subtotal = getSubtotal();
  const deliveryCharge = getDeliveryCharge();
  const total = getTotal();
  const freeDeliveryThreshold = 500;
  const amountForFreeDelivery = freeDeliveryThreshold - subtotal;

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (userId) {
      await syncUpdateQuantity(productId, quantity, userId);
    } else {
      updateQuantity(productId, quantity);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (userId) {
      await syncRemoveItem(productId, userId);
    } else {
      removeItem(productId);
    }
    toast.success('Item removed from cart');
  };

  const handleClearCart = async () => {
    if (userId) {
      await syncClearCart(userId);
    } else {
      clearCart();
    }
    toast.success('Cart cleared');
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={toggleCart}
      />
      
      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-primary-600" size={24} />
            <h2 className="text-lg font-semibold">Your Cart</h2>
            <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-sm font-medium">
              {items.length} items
            </span>
          </div>
          <button 
            onClick={toggleCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Free Delivery Progress */}
        {items.length > 0 && subtotal < freeDeliveryThreshold && (
          <div className="px-4 py-3 bg-primary-50 border-b">
            <p className="text-sm text-primary-700 mb-2">
              Add <strong>₹{amountForFreeDelivery.toFixed(0)}</strong> more for FREE delivery
            </p>
            <div className="w-full bg-primary-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((subtotal / freeDeliveryThreshold) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag size={40} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add items to your cart to continue shopping</p>
              <button 
                onClick={toggleCart}
                className="btn-primary"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div 
                  key={item.product.id}
                  className="flex gap-4 bg-gray-50 rounded-lg p-3"
                >
                  <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 truncate">{item.product.name}</h4>
                    <p className="text-sm text-gray-500">{item.product.unit}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-primary-600">₹{item.product.price}</span>
                      {item.product.discount > 0 && (
                        <span className="text-xs text-gray-400 line-through">₹{item.product.originalPrice}</span>
                      )}
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white border rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white border rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Totals */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4 bg-gray-50">
            {/* Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className={deliveryCharge === 0 ? 'text-green-600 font-medium' : ''}>
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary-600">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Link
                href="/checkout"
                onClick={toggleCart}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </Link>
              <button
                onClick={toggleCart}
                className="w-full btn-outline"
              >
                Continue Shopping
              </button>
            </div>

            {/* Clear Cart */}
            <button
              onClick={handleClearCart}
              className="w-full text-sm text-red-600 hover:text-red-700"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
