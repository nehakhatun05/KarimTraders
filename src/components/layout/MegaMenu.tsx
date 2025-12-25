'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Grid3X3, Percent, Flame, Star, TrendingUp, Leaf, Apple, Carrot, Nut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface SubCategory {
  name: string;
  href: string;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  featured?: string;
  subcategories: SubCategory[];
}

const categories: Category[] = [
  {
    id: 'fresh-fruits',
    name: 'Fresh Fruits',
    icon: <Apple size={20} />,
    color: 'bg-red-500',
    featured: '/categories/fruits.jpg',
    subcategories: [
      { name: 'Seasonal Fruits', href: '/products?category=cat-1&sub=seasonal' },
      { name: 'Exotic Fruits', href: '/products?category=cat-1&sub=exotic' },
      { name: 'Citrus Fruits', href: '/products?category=cat-1&sub=citrus' },
      { name: 'Berries', href: '/products?category=cat-1&sub=berries' },
      { name: 'Tropical Fruits', href: '/products?category=cat-1&sub=tropical' },
      { name: 'View All Fruits', href: '/products?category=cat-1' },
    ]
  },
  {
    id: 'fresh-vegetables',
    name: 'Fresh Vegetables',
    icon: <Carrot size={20} />,
    color: 'bg-green-500',
    subcategories: [
      { name: 'Leafy Vegetables', href: '/products?category=cat-2&sub=leafy' },
      { name: 'Root Vegetables', href: '/products?category=cat-2&sub=root' },
      { name: 'Gourds & Squashes', href: '/products?category=cat-2&sub=gourds' },
      { name: 'Onions & Potatoes', href: '/products?category=cat-2&sub=onion-potato' },
      { name: 'Exotic Vegetables', href: '/products?category=cat-2&sub=exotic' },
      { name: 'View All Vegetables', href: '/products?category=cat-2' },
    ]
  },
  {
    id: 'dry-fruits',
    name: 'Dry Fruits & Nuts',
    icon: <Nut size={20} />,
    color: 'bg-amber-500',
    subcategories: [
      { name: 'Almonds', href: '/products?category=cat-3&sub=almonds' },
      { name: 'Cashews', href: '/products?category=cat-3&sub=cashews' },
      { name: 'Walnuts', href: '/products?category=cat-3&sub=walnuts' },
      { name: 'Pistachios', href: '/products?category=cat-3&sub=pistachios' },
      { name: 'Raisins & Dates', href: '/products?category=cat-3&sub=raisins-dates' },
      { name: 'View All Dry Fruits', href: '/products?category=cat-3' },
    ]
  },
  {
    id: 'spices',
    name: 'Spices & Seasonings',
    icon: <Flame size={20} />,
    color: 'bg-orange-500',
    subcategories: [
      { name: 'Whole Spices', href: '/products?category=cat-4&sub=whole' },
      { name: 'Ground Spices', href: '/products?category=cat-4&sub=ground' },
      { name: 'Blended Spices', href: '/products?category=cat-4&sub=blended' },
      { name: 'Herbs & Seasonings', href: '/products?category=cat-4&sub=herbs' },
      { name: 'Exotic Spices', href: '/products?category=cat-4&sub=exotic' },
      { name: 'View All Spices', href: '/products?category=cat-4' },
    ]
  },
];

const quickLinks = [
  { name: 'Best Sellers', href: '/products?sort=bestseller', icon: <TrendingUp size={16} />, color: 'text-orange-600' },
  { name: 'New Arrivals', href: '/products?sort=newest', icon: <Star size={16} />, color: 'text-blue-600' },
  { name: 'Offers', href: '/products?offers=true', icon: <Percent size={16} />, color: 'text-red-600' },
];

export default function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setActiveCategory(null);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const activeCategoryData = categories.find(c => c.id === activeCategory);

  return (
    <div 
      className="relative"
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm transition-all rounded-lg ${
          isOpen 
            ? 'bg-primary-600 text-white shadow-lg' 
            : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
        }`}
      >
        <Grid3X3 size={18} />
        <span className="hidden sm:inline">Shop by Category</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 flex bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          style={{ minWidth: '700px' }}
        >
          {/* Categories List */}
          <div className="w-64 bg-gray-50 border-r border-gray-100">
            {/* Quick Links */}
            <div className="p-3 border-b border-gray-200">
              <div className="flex gap-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-white shadow-sm hover:shadow-md transition-shadow ${link.color}`}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Category List */}
            <div className="py-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onMouseEnter={() => setActiveCategory(category.id)}
                  className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors ${
                    activeCategory === category.id 
                      ? 'bg-white border-r-2 border-primary-600' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center text-white`}>
                      {category.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{category.name}</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Subcategories Panel */}
          <div className="flex-1 p-6">
            {activeCategoryData ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {activeCategoryData.name}
                  </h3>
                  <Link 
                    href={`/products?category=${activeCategoryData.id}`}
                    className="text-primary-600 text-sm font-medium hover:underline"
                  >
                    View All →
                  </Link>
                </div>
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  {activeCategoryData.subcategories.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className="text-sm text-gray-600 hover:text-primary-600 hover:translate-x-1 transition-all py-1"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>

                {/* Featured Banner */}
                <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-green-50 rounded-xl">
                  <p className="text-xs text-primary-600 font-semibold uppercase mb-1">Featured</p>
                  <p className="text-sm text-gray-800 font-medium">
                    Up to 30% off on {activeCategoryData.name}
                  </p>
                  <Link 
                    href={`/products?category=${activeCategoryData.id}&offers=true`}
                    className="inline-block mt-2 text-xs font-semibold text-primary-700 hover:text-primary-800"
                  >
                    Shop Now →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Grid3X3 size={48} className="mb-3 opacity-50" />
                <p className="text-sm">Hover over a category to explore</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
