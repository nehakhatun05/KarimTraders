'use client';

import { useState, useEffect } from 'react';
import { Clock, Tag, Percent, Gift, Copy, Check } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { products, coupons } from '@/data';
import toast from 'react-hot-toast';

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 34,
    seconds: 56,
  });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dealProducts = products
    .filter((p) => p.discount > 0)
    .sort((a, b) => b.discount - a.discount);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Coupon code copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-12">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
                Today's Best Deals 🔥
              </h1>
              <p className="text-white/90 text-lg">
                Grab amazing discounts on fresh products!
              </p>
            </div>
            
            {/* Countdown Timer */}
            <div className="flex items-center gap-3">
              <Clock className="text-white/80" size={24} />
              <span className="text-white/80">Ends in:</span>
              <div className="flex gap-2">
                <div className="bg-white/20 rounded-lg px-3 py-2 text-center">
                  <span className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <p className="text-xs opacity-80">HRS</p>
                </div>
                <span className="text-2xl font-bold">:</span>
                <div className="bg-white/20 rounded-lg px-3 py-2 text-center">
                  <span className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <p className="text-xs opacity-80">MIN</p>
                </div>
                <span className="text-2xl font-bold">:</span>
                <div className="bg-white/20 rounded-lg px-3 py-2 text-center">
                  <span className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <p className="text-xs opacity-80">SEC</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Coupon Codes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Tag className="text-primary-600" />
            Available Coupons
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.filter(c => c.isActive).map((coupon) => (
              <div
                key={coupon.id}
                className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary-600 relative overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-full -mr-12 -mt-12" />
                
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className="text-primary-600" size={20} />
                    <span className="text-lg font-bold text-primary-600">
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discountValue}% OFF`
                        : `₹${coupon.discountValue} OFF`
                      }
                    </span>
                  </div>
                  
                  <p className="text-gray-800 font-medium mb-2">{coupon.description}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Min. order: ₹{coupon.minOrderValue}
                    {coupon.maxDiscount && ` • Max discount: ₹${coupon.maxDiscount}`}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg px-4 py-2 font-mono font-bold text-gray-800">
                      {coupon.code}
                    </div>
                    <button
                      onClick={() => copyCode(coupon.code)}
                      className={`p-2 rounded-lg transition-colors ${
                        copiedCode === coupon.code
                          ? 'bg-green-100 text-green-600'
                          : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                      }`}
                    >
                      {copiedCode === coupon.code ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Offer Banners */}
        <section className="mb-12">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Gift size={24} />
                <span className="font-bold text-lg">First Order Special</span>
              </div>
              <p className="text-3xl font-bold mb-2">20% OFF</p>
              <p className="text-white/90">Use code WELCOME20 on your first order</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Gift size={24} />
                <span className="font-bold text-lg">Free Delivery</span>
              </div>
              <p className="text-3xl font-bold mb-2">₹0 Delivery</p>
              <p className="text-white/90">On all orders above ₹500</p>
            </div>
          </div>
        </section>

        {/* Products on Sale */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Products on Sale</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {dealProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
