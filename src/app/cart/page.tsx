'use client';

import Link from 'next/link';
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Tag,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function CartPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  const { 
    items, 
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

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const subtotal = getSubtotal();
  const deliveryCharge = getDeliveryCharge();
  const total = getTotal() - couponDiscount;
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
    toast.success('Item removed');
  };

  const handleClearCart = async () => {
    if (userId) {
      await syncClearCart(userId);
    } else {
      clearCart();
    }
    toast.success('Cart cleared');
  };

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'WELCOME20') {
      const discount = Math.min(subtotal * 0.2, 200);
      setCouponDiscount(discount);
      setAppliedCoupon(couponCode.toUpperCase());
      toast.success(`Coupon applied! You save ₹${discount.toFixed(0)}`);
    } else if (couponCode.toUpperCase() === 'FRESH50') {
      setCouponDiscount(50);
      setAppliedCoupon(couponCode.toUpperCase());
      toast.success('Coupon applied! You save ₹50');
    } else {
      toast.error('Invalid coupon code');
    }
    setCouponCode('');
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    toast.success('Coupon removed');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-lg mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="text-gray-400" size={48} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Add items to your cart to continue shopping</p>
            <Link href="/products" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free Delivery Progress */}
            {subtotal < freeDeliveryThreshold && (
              <div className="bg-primary-50 rounded-xl p-4">
                <p className="text-primary-700 mb-2">
                  Add <strong>₹{amountForFreeDelivery.toFixed(0)}</strong> more for FREE delivery!
                </p>
                <div className="w-full bg-primary-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((subtotal / freeDeliveryThreshold) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="bg-white rounded-xl shadow-sm divide-y">
              {items.map((item) => (
                <div key={item.product.id} className="p-4 md:p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link href={`/products/${item.product.slug}`} className="flex-shrink-0">
                      <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product.slug}`}>
                        <h3 className="font-medium text-gray-800 hover:text-primary-600 transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">{item.product.unit}</p>
                      
                      {/* Price */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg font-semibold text-primary-600">
                          ₹{item.product.price}
                        </span>
                        {item.product.discount > 0 && (
                          <>
                            <span className="text-sm text-gray-400 line-through">
                              ₹{item.product.originalPrice}
                            </span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              {item.product.discount}% off
                            </span>
                          </>
                        )}
                      </div>

                      {/* Quantity & Actions - Mobile */}
                      <div className="flex items-center justify-between mt-4 md:hidden">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-10 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Quantity & Actions - Desktop */}
                    <div className="hidden md:flex flex-col items-end justify-between">
                      <p className="font-semibold text-gray-800">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-10 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="flex justify-between items-center">
              <Link
                href="/products"
                className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-2"
              >
                ← Continue Shopping
              </Link>
              <button
                onClick={handleClearCart}
                className="text-red-600 font-medium hover:text-red-700"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              {/* Coupon Section */}
              <div className="mb-6">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <Tag size={18} />
                      <span className="font-medium">{appliedCoupon}</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-red-500 text-sm hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 input-field"
                    />
                    <button onClick={handleApplyCoupon} className="btn-outline">
                      Apply
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Try: WELCOME20, FRESH50
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({items.length} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className={deliveryCharge === 0 ? 'text-green-600' : ''}>
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-3 border-t">
                  <span>Total</span>
                  <span className="text-primary-600">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Savings */}
              {(couponDiscount > 0 || items.some(i => i.product.discount > 0)) && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-green-700 text-sm font-medium">
                    🎉 You're saving ₹
                    {(
                      items.reduce((sum, item) => 
                        sum + (item.product.originalPrice - item.product.price) * item.quantity, 0
                      ) + couponDiscount
                    ).toFixed(0)} on this order!
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full btn-primary flex items-center justify-center gap-2 mt-6"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck size={18} className="text-primary-600" />
                  <span>Free delivery on orders above ₹500</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <ShieldCheck size={18} className="text-primary-600" />
                  <span>100% secure payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
