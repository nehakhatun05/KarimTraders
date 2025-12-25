'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Home, ArrowRight } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId') || 'KT12345678';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600" size={48} />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for shopping with Karim Traders. Your order has been confirmed.
        </p>

        {/* Order ID */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Order ID</p>
          <p className="text-xl font-bold text-primary-600">{orderId}</p>
        </div>

        {/* Order Status Steps */}
        <div className="flex justify-between items-center mb-8 px-4">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center mb-2">
              <CheckCircle size={20} />
            </div>
            <span className="text-xs text-gray-600">Confirmed</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-2">
            <div className="h-full bg-green-600 w-0" />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center mb-2">
              <Package size={20} />
            </div>
            <span className="text-xs text-gray-600">Packed</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-2" />
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center mb-2">
              <Truck size={20} />
            </div>
            <span className="text-xs text-gray-600">Shipped</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-2" />
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center mb-2">
              <Home size={20} />
            </div>
            <span className="text-xs text-gray-600">Delivered</span>
          </div>
        </div>

        {/* Info */}
        <div className="bg-primary-50 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-primary-800">
            <strong>What's next?</strong>
          </p>
          <ul className="text-sm text-primary-700 mt-2 space-y-1">
            <li>• You'll receive an order confirmation email shortly</li>
            <li>• We'll notify you when your order is packed and shipped</li>
            <li>• Track your order from your account dashboard</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/account/orders" className="w-full btn-primary flex items-center justify-center gap-2">
            Track Order
            <ArrowRight size={18} />
          </Link>
          <Link href="/products" className="w-full btn-outline flex items-center justify-center gap-2">
            Continue Shopping
          </Link>
        </div>

        {/* Support */}
        <p className="text-sm text-gray-500 mt-6">
          Need help? <Link href="/help" className="text-primary-600 hover:underline">Contact Support</Link>
        </p>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
