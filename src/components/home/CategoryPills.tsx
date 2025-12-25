'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Apple, Carrot, Nut, Flame, ShoppingBag } from 'lucide-react';

interface CategoryPill {
  id: string;
  name: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  bgColor: string;
}

const categoryPills: CategoryPill[] = [
  { id: 'fruits', name: 'Fresh Fruits', icon: <Apple size={20} />, href: '/products?category=cat-1', color: 'text-red-600', bgColor: 'bg-red-50 hover:bg-red-100' },
  { id: 'vegetables', name: 'Fresh Vegetables', icon: <Carrot size={20} />, href: '/products?category=cat-2', color: 'text-green-600', bgColor: 'bg-green-50 hover:bg-green-100' },
  { id: 'dryfruits', name: 'Dry Fruits & Nuts', icon: <Nut size={20} />, href: '/products?category=cat-3', color: 'text-amber-600', bgColor: 'bg-amber-50 hover:bg-amber-100' },
  { id: 'spices', name: 'Spices & Seasonings', icon: <Flame size={20} />, href: '/products?category=cat-4', color: 'text-orange-600', bgColor: 'bg-orange-50 hover:bg-orange-100' },
  { id: 'all', name: 'View All', icon: <ShoppingBag size={20} />, href: '/products', color: 'text-gray-600', bgColor: 'bg-gray-50 hover:bg-gray-100' },
];

export default function CategoryPills() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScroll);
      checkScroll();
      return () => scrollElement.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative py-4 bg-white border-b border-gray-100">
      <div className="container-custom">
        <div className="relative">
          {/* Scroll Left Button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
          )}

          {/* Pills Container */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categoryPills.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all ${category.bgColor} ${category.color} font-medium text-sm shadow-sm hover:shadow-md`}
              >
                {category.icon}
                <span>{category.name}</span>
              </Link>
            ))}
          </div>

          {/* Scroll Right Button */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          )}

          {/* Gradient Fades */}
          {canScrollLeft && (
            <div className="absolute left-10 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
          )}
          {canScrollRight && (
            <div className="absolute right-10 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
}
