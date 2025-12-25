'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, Grid3X3, ShoppingCart, Heart, User, Search, X, LucideIcon } from 'lucide-react';
import { useCartStore, useWishlistStore } from '@/store';

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  count?: number;
  onClick?: () => void;
}

export default function MobileNav() {
  const pathname = usePathname();
  const { status } = useSession();
  const { items: cartItems, toggleCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isLoggedIn = status === 'authenticated';

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navItems: NavItem[] = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/products', icon: Grid3X3, label: 'Categories' },
    { href: '#search', icon: Search, label: 'Search', onClick: () => setShowSearch(true) },
    { href: '#cart', icon: ShoppingCart, label: 'Cart', count: cartItemCount, onClick: toggleCart },
    { href: isLoggedIn ? '/account' : '/login', icon: User, label: isLoggedIn ? 'Account' : 'Login' },
  ];

  return (
    <>
      {/* Search Overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-[60] bg-white md:hidden animate-slide-up">
          <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white">
            <button 
              onClick={() => setShowSearch(false)}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full"
            >
              <X size={24} className="text-gray-600" />
            </button>
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search for groceries, fruits..."
                className="w-full py-3 pl-10 pr-4 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value;
                    if (value.trim()) {
                      setShowSearch(false);
                      window.location.href = `/products?search=${encodeURIComponent(value)}`;
                    }
                  }
                }}
              />
            </div>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100%-72px)]">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Popular Searches</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['Fresh vegetables', 'Milk', 'Bread', 'Rice', 'Fruits', 'Eggs', 'Oil'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setShowSearch(false);
                    window.location.href = `/products?search=${encodeURIComponent(term)}`;
                  }}
                  className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Browse Categories</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Fresh Fruits', emoji: '🍎', href: '/products?category=cat-1' },
                { name: 'Fresh Vegetables', emoji: '🥬', href: '/products?category=cat-2' },
                { name: 'Dry Fruits & Nuts', emoji: '🥜', href: '/products?category=cat-3' },
                { name: 'Spices & Seasonings', emoji: '🌶️', href: '/products?category=cat-4' },
              ].map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  onClick={() => setShowSearch(false)}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors"
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav 
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (item.onClick) {
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="flex flex-col items-center gap-0.5 px-4 py-1.5 relative group"
                >
                  <div className={`relative p-1.5 rounded-xl transition-colors ${
                    isActive ? 'bg-primary-50' : 'group-hover:bg-gray-100'
                  }`}>
                    <Icon size={22} className={isActive ? 'text-primary-600' : 'text-gray-500'} />
                    {item.count && item.count > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {item.count > 99 ? '99+' : item.count}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${
                    isActive ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 px-4 py-1.5 relative group"
              >
                <div className={`relative p-1.5 rounded-xl transition-colors ${
                  isActive ? 'bg-primary-50' : 'group-hover:bg-gray-100'
                }`}>
                  <Icon size={22} className={isActive ? 'text-primary-600' : 'text-gray-500'} />
                  {item.count && item.count > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {item.count > 99 ? '99+' : item.count}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${
                  isActive ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
