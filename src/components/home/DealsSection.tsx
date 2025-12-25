'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, ArrowRight, Zap, Flame, Sparkles } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { products } from '@/data';

export default function DealsSection() {
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

  // Get products with highest discounts
  const dealProducts = products
    .filter((p) => p.discount > 0)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 4);

  return (
    <section className="py-8 sm:py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container-custom relative">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg animate-bounce-subtle">
              <Flame className="text-orange-500" size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white">
                  Flash Deals
                </h2>
                <span className="hidden sm:flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                  <Sparkles size={12} /> HOT
                </span>
              </div>
              <p className="text-white/80 text-sm sm:text-base">Grab before they're gone!</p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-sm rounded-2xl p-3 sm:p-4">
            <Clock className="text-white hidden sm:block" size={24} />
            <div className="text-white/80 text-sm hidden sm:block">Ends in:</div>
            <div className="flex gap-2 sm:gap-3">
              <div className="bg-white rounded-xl px-3 py-2 text-center min-w-[50px] sm:min-w-[60px] shadow-lg">
                <span className="text-xl sm:text-2xl font-bold text-gray-800 block">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500 uppercase">Hours</span>
              </div>
              <span className="text-white text-2xl font-bold self-center">:</span>
              <div className="bg-white rounded-xl px-3 py-2 text-center min-w-[50px] sm:min-w-[60px] shadow-lg">
                <span className="text-xl sm:text-2xl font-bold text-gray-800 block">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500 uppercase">Mins</span>
              </div>
              <span className="text-white text-2xl font-bold self-center">:</span>
              <div className="bg-white rounded-xl px-3 py-2 text-center min-w-[50px] sm:min-w-[60px] shadow-lg">
                <span className="text-xl sm:text-2xl font-bold text-red-500 block animate-pulse">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500 uppercase">Secs</span>
              </div>
            </div>
          </div>

          <Link
            href="/offers"
            className="hidden lg:flex items-center gap-2 bg-white text-orange-600 font-bold py-3 px-6 rounded-xl hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            View All Deals
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Deal Products */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {dealProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-6 lg:hidden">
          <Link
            href="/offers"
            className="w-full bg-white text-orange-600 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-orange-50 transition-colors"
          >
            View All Deals
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
