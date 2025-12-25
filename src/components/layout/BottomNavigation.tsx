'use client';

import { useState, useEffect } from 'react';
import { Home, Search, Grid3X3, ShoppingCart, User, Heart, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  action?: 'search' | 'menu';
  badge?: number;
}

export default function BottomNavigation() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname();
  const { items } = useCartStore();
  
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

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
    { id: 'home', label: 'Home', icon: <Home size={22} />, href: '/' },
    { id: 'categories', label: 'Categories', icon: <Grid3X3 size={22} />, href: '/products' },
    { id: 'search', label: 'Search', icon: <Search size={22} />, action: 'search' },
    { id: 'cart', label: 'Cart', icon: <ShoppingCart size={22} />, href: '/cart', badge: cartItemCount },
    { id: 'account', label: 'Account', icon: <User size={22} />, href: '/account' },
  ];

  const isActive = (item: NavItem) => {
    if (!item.href) return false;
    if (!pathname) return false;
    if (item.href === '/') return pathname === '/';
    return pathname.startsWith(item.href);
  };

  const handleNavClick = (item: NavItem) => {
    if (item.action === 'search') {
      setShowSearch(true);
    }
  };

  return (
    <>
      {/* Search Overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-[60] bg-white md:hidden">
          <div className="flex items-center gap-3 p-4 border-b">
            <button 
              onClick={() => setShowSearch(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={24} />
            </button>
            <input
              autoFocus
              type="text"
              placeholder="Search for products..."
              className="flex-1 py-2 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = (e.target as HTMLInputElement).value;
                  if (value.trim()) {
                    window.location.href = `/products?search=${encodeURIComponent(value)}`;
                  }
                }
              }}
            />
          </div>
          <div className="p-4">
            <p className="text-sm font-medium text-gray-500 mb-3">Popular Searches</p>
            <div className="flex flex-wrap gap-2">
              {['Fresh vegetables', 'Milk', 'Bread', 'Rice', 'Fruits'].map((term) => (
                <Link
                  key={term}
                  href={`/products?search=${encodeURIComponent(term)}`}
                  onClick={() => setShowSearch(false)}
                  className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav 
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center justify-around px-2 py-1.5 pb-safe">
          {navItems.map((item) => {
            const active = isActive(item);
            const Component = item.href ? Link : 'button';
            
            return (
              <Component
                key={item.id}
                href={item.href || '#'}
                onClick={() => handleNavClick(item)}
                className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl transition-all ${
                  active 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${active ? 'text-primary-600' : ''}`}>
                  {item.label}
                </span>
              </Component>
            );
          })}
        </div>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-16 md:hidden" />
    </>
  );
}
