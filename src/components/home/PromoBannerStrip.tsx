'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, Percent, Zap, Gift, Truck } from 'lucide-react';

interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  href: string;
  ctaText: string;
}

const promoBanners: PromoBanner[] = [
  {
    id: 'offer1',
    title: 'Flash Sale!',
    subtitle: 'Up to 50% off on Fresh Vegetables',
    icon: <Zap size={24} className="text-yellow-300" />,
    bgColor: 'bg-gradient-to-r from-orange-500 to-red-500',
    textColor: 'text-white',
    href: '/products?category=cat-2&offers=true',
    ctaText: 'Shop Now',
  },
  {
    id: 'offer2',
    title: 'Free Delivery',
    subtitle: 'On orders above ₹499 - Use code FREE499',
    icon: <Truck size={24} />,
    bgColor: 'bg-gradient-to-r from-primary-500 to-emerald-500',
    textColor: 'text-white',
    href: '/offers',
    ctaText: 'Order Now',
  },
  {
    id: 'offer3',
    title: 'First Order Discount',
    subtitle: 'Get 20% off on your first order - Code: FIRST20',
    icon: <Gift size={24} />,
    bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
    textColor: 'text-white',
    href: '/products',
    ctaText: 'Shop Now',
  },
  {
    id: 'offer4',
    title: 'Weekend Special',
    subtitle: 'Flat 30% off on Dry Fruits & Nuts',
    icon: <Percent size={24} />,
    bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    textColor: 'text-white',
    href: '/products?category=cat-3&offers=true',
    ctaText: 'Grab Deal',
  },
];

export default function PromoBannerStrip() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promoBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const currentBanner = promoBanners[currentIndex];

  return (
    <div className={`relative ${currentBanner.bgColor} ${currentBanner.textColor} py-3 overflow-hidden`}>
      <div className="container-custom">
        <div className="flex items-center justify-between gap-4">
          {/* Navigation Left */}
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + promoBanners.length) % promoBanners.length)}
            className="hidden sm:flex w-8 h-8 rounded-full bg-white/20 items-center justify-center hover:bg-white/30 transition-colors flex-shrink-0"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Banner Content */}
          <Link 
            href={currentBanner.href}
            className="flex-1 flex items-center justify-center gap-3 sm:gap-4 group"
          >
            <div className="animate-bounce-subtle">
              {currentBanner.icon}
            </div>
            <div className="text-center sm:text-left">
              <span className="font-bold text-sm sm:text-base">{currentBanner.title}</span>
              <span className="hidden sm:inline mx-2">•</span>
              <span className="hidden sm:inline text-sm opacity-90">{currentBanner.subtitle}</span>
            </div>
            <span className="hidden md:inline-flex items-center gap-1 px-4 py-1.5 bg-white/20 rounded-full text-sm font-semibold hover:bg-white/30 transition-colors group-hover:scale-105">
              {currentBanner.ctaText}
              <ChevronRight size={16} />
            </span>
          </Link>

          {/* Navigation Right + Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % promoBanners.length)}
              className="hidden sm:flex w-8 h-8 rounded-full bg-white/20 items-center justify-center hover:bg-white/30 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-1.5 mt-2">
          {promoBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentIndex ? 'w-4 bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-1/2 h-full bg-white/5 rotate-12 transform" />
        <div className="absolute -bottom-1/2 -right-1/4 w-1/2 h-full bg-white/5 rotate-12 transform" />
      </div>
    </div>
  );
}
