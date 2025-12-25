'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Clock, Truck, Shield, Percent } from 'lucide-react';
import { banners } from '@/data';

const sidePromotions = [
  {
    id: 'promo1',
    title: 'Fresh Fruits',
    subtitle: 'Up to 40% Off',
    image: '/images/hero/fresh-fruit.png',
    href: '/products?category=cat-1',
    bgColor: 'from-orange-400 to-red-500',
  },
  {
    id: 'promo2',
    title: 'Exotic Vegetables',
    subtitle: 'Farm Fresh Daily',
    image: '/images/hero/exotic-vegetable.png',
    href: '/products?category=cat-2',
    bgColor: 'from-green-400 to-emerald-500',
  },
];

const features = [
  { icon: <Clock size={20} />, text: '10-30 min delivery' },
  { icon: <Truck size={20} />, text: 'Free delivery ₹499+' },
  { icon: <Shield size={20} />, text: '100% Quality Assured' },
  { icon: <Percent size={20} />, text: 'Best Prices' },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <section className="bg-gray-50 py-4">
      <div className="container-custom">
        {/* Main Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Slider - Takes full width on mobile, 3 columns on large screens */}
          <div className="lg:col-span-3 relative rounded-2xl overflow-hidden shadow-lg">
            <div className="relative h-[200px] sm:h-[280px] md:h-[350px] lg:h-[400px]">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-all duration-700 ${
                    index === currentSlide 
                      ? 'opacity-100 z-10 scale-100' 
                      : 'opacity-0 z-0 scale-105'
                  }`}
                >
                  <div className="relative h-full">
                    <Image
                      src={banner.image}
                      alt={banner.title}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 75vw"
                      className="object-cover object-center"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 sm:from-black/70 via-black/20 sm:via-black/30 to-transparent" />
                    
                    {/* Content */}
                    <div className="absolute inset-0 flex items-center p-4 sm:p-6 md:p-10">
                      <div className="max-w-lg w-full">
                        {/* Badge */}
                        <span className="inline-block px-2 py-1 sm:px-3 sm:py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full mb-2 sm:mb-4 animate-pulse">
                          🔥 HOT DEAL
                        </span>
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-white mb-2 sm:mb-3 leading-tight drop-shadow-lg">
                          {banner.title}
                        </h2>
                        {banner.subtitle && (
                          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/95 mb-4 sm:mb-6 line-clamp-2 drop-shadow-md">
                            {banner.subtitle}
                          </p>
                        )}
                        {banner.buttonText && (
                          <Link
                            href={banner.link}
                            className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-900 font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base"
                          >
                            {banner.buttonText}
                            <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 touch-manipulation"
              >
                <ChevronLeft size={16} className="sm:w-[20px] sm:h-[20px]" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 touch-manipulation"
              >
                <ChevronRight size={16} className="sm:w-[20px] sm:h-[20px]" />
              </button>

              {/* Progress Dots */}
              <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 touch-manipulation ${
                      index === currentSlide
                        ? 'bg-white w-6 sm:w-8'
                        : 'bg-white/50 hover:bg-white/75 w-2'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Side Promotions - Takes 1 column on large screens */}
          <div className="hidden lg:flex flex-col gap-4">
            {sidePromotions.map((promo) => (
              <Link
                key={promo.id}
                href={promo.href}
                className="relative flex-1 rounded-2xl overflow-hidden shadow-lg group"
              >
                <div className="absolute inset-0">
                  <Image
                    src={promo.image}
                    alt={promo.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="relative h-full flex flex-col justify-end p-5 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                  <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">{promo.title}</h3>
                  <p className="text-white/90 text-sm mb-3 drop-shadow-md">{promo.subtitle}</p>
                  <span className="inline-flex items-center gap-1 text-white text-sm font-medium group-hover:translate-x-1 transition-transform drop-shadow-md">
                    Shop Now <ChevronRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Features Strip */}
        <div className="mt-4 bg-white rounded-2xl shadow-sm p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 justify-center md:justify-start"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 flex-shrink-0">
                  {feature.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {feature.text}
                </span>
                <span className="text-xs font-medium text-gray-700 sm:hidden">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
