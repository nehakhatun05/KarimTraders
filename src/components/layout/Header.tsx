'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { 
  ShoppingCart, 
  Heart, 
  User, 
  Menu, 
  X, 
  ChevronDown,
  Phone,
  LogOut,
  Package,
  Headphones,
  Clock,
  Truck,
  Zap
} from 'lucide-react';
import { useCartStore, useWishlistStore, useUIStore, useSearchStore } from '@/store';
import { categories } from '@/data';
import SearchModal from '../search/SearchModal';
import CartSidebar from '../cart/CartSidebar';
import LocationPicker from './LocationPicker';
import MegaMenu from './MegaMenu';
import SmartSearch from './SmartSearch';
import NotificationPanel from '../notifications/NotificationPanel';

export default function Header() {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { items: cartItems, toggleCart, isOpen: isCartOpen } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();
  const { isOpen: isSearchOpen, toggleSearch } = useSearchStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const isLoggedIn = status === 'authenticated' && session?.user;

  return (
    <>
      {/* Promo Strip */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-600 text-white py-2 hidden md:block">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 animate-pulse">
              <Zap size={16} className="text-yellow-300" />
              <span className="font-medium">Free Delivery on orders above ₹499</span>
            </div>
            <span className="text-white/40">|</span>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>Express delivery in 10-30 mins</span>
            </div>
            <span className="text-white/40">|</span>
            <Link href="/offers" className="flex items-center gap-2 hover:text-yellow-300 transition-colors">
              <span className="bg-yellow-400 text-primary-800 text-xs px-2 py-0.5 rounded font-bold">HOT</span>
              <span>Today's Deals: Up to 50% Off</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header 
        className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
          isScrolled ? 'shadow-lg' : 'shadow-sm'
        }`}
      >
        {/* Desktop Header Row 1 - Top utility bar */}
        <div className="hidden md:block border-b border-gray-100">
          <div className="container-custom py-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={14} />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Headphones size={14} />
                  <Link href="/help" className="hover:text-primary-600">24/7 Support</Link>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <Link href="/track-order" className="flex items-center gap-2 text-gray-600 hover:text-primary-600">
                  <Truck size={14} />
                  Track Order
                </Link>
                <Link href="/help" className="text-gray-600 hover:text-primary-600">Help Center</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Location Bar - Above main header */}
        <div className="md:hidden bg-gray-50 border-b border-gray-100 py-2 px-3">
          <LocationPicker />
        </div>

        {/* Desktop Header Row 2 - Main Navigation */}
        <div className="container-custom !px-2 sm:!px-4 md:!px-6">
          <div className="flex items-center justify-between gap-4 h-16 md:h-20">
            {/* Left Section - Menu + Logo + Location */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Mobile Menu Button */}
              <button 
                className="md:hidden p-1.5"
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              {/* Logo */}
              <Link href="/" className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <span className="text-white font-bold text-lg sm:text-2xl">K</span>
                </div>
                <div className="hidden xs:block">
                  <h1 className="font-display font-bold text-lg sm:text-xl text-gray-800 leading-tight">KARIM</h1>
                  <p className="text-[10px] sm:text-xs text-primary-600 font-semibold leading-tight tracking-wide">TRADERS</p>
                </div>
              </Link>

              {/* Location Picker - Desktop */}
              <div className="hidden lg:block ml-4 border-l border-gray-200 pl-4">
                <LocationPicker />
              </div>
            </div>

            {/* Center - Search & Categories */}
            <div className="hidden md:flex items-center gap-3 flex-1 max-w-3xl">
              <MegaMenu />
              <SmartSearch />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              {/* Mobile Search Button */}
              <button 
                className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                onClick={toggleSearch}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>

              {/* Notifications */}
              <div className="hidden sm:block">
                <NotificationPanel />
              </div>

              {/* Wishlist */}
              <Link 
                href="/wishlist" 
                className="hidden md:flex p-2 hover:bg-gray-100 rounded-full relative group"
              >
                <Heart size={22} className="text-gray-600 group-hover:text-red-500 transition-colors" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* User Account */}
              {isLoggedIn ? (
                <div className="hidden md:block relative">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-sm font-bold text-white">
                        {session.user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-[10px] text-gray-500 leading-tight">Welcome back,</p>
                      <p className="text-sm font-semibold text-gray-800">{session.user?.name?.split(' ')[0] || 'User'}</p>
                    </div>
                    <ChevronDown size={16} className="text-gray-400 hidden lg:block" />
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden">
                      <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-green-50 border-b border-gray-100">
                        <p className="font-medium text-gray-800">{session.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                      </div>
                      
                      {(session.user?.role === 'ADMIN' || session.user?.role === 'SUPER_ADMIN') && (
                        <>
                          <Link 
                            href="/admin" 
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary-50 text-primary-600 font-medium"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            Admin Dashboard
                          </Link>
                          <hr className="my-1 border-gray-100" />
                        </>
                      )}
                      
                      <Link 
                        href="/account" 
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User size={18} />
                        My Account
                      </Link>
                      <Link 
                        href="/account/orders" 
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Package size={18} />
                        My Orders
                      </Link>
                      <Link 
                        href="/wishlist" 
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Heart size={18} />
                        Wishlist
                      </Link>
                      
                      <hr className="my-1 border-gray-100" />
                      
                      <button 
                        onClick={() => {
                          setShowUserMenu(false);
                          signOut({ callbackUrl: '/' });
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 w-full"
                      >
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="hidden md:flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <User size={22} className="text-gray-600" />
                  <div className="text-left hidden lg:block">
                    <p className="text-[10px] text-gray-500 leading-tight">Sign in</p>
                    <p className="text-sm font-semibold text-gray-800">Account</p>
                  </div>
                </Link>
              )}

              {/* Cart Button - BigBasket Style */}
              <button 
                onClick={toggleCart}
                className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-3 py-2 md:px-4 md:py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <div className="relative">
                  <ShoppingCart size={22} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 text-primary-800 text-[10px] rounded-full flex items-center justify-center font-bold shadow">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-[10px] text-primary-200 leading-tight">My Cart</p>
                  <p className="text-sm font-bold">₹{cartTotal.toFixed(0)}</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-xl animate-slide-down max-h-[80vh] overflow-y-auto">
            <div className="p-4">
              {/* User Info for Mobile */}
              {isLoggedIn && (
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {session.user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{session.user?.name}</p>
                      <p className="text-xs text-gray-500">{session.user?.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Categories */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase px-2 mb-2">Categories</p>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                    onClick={toggleMobileMenu}
                  >
                    <span className="text-2xl">{category.icon}</span>
                    <span className="font-medium text-gray-800">{category.name}</span>
                  </Link>
                ))}
              </div>

              {/* Quick Links */}
              <div className="border-t border-gray-100 pt-4 mt-4 space-y-1">
                <Link
                  href="/offers"
                  className="flex items-center gap-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  onClick={toggleMobileMenu}
                >
                  <span className="text-2xl">🔥</span>
                  <span className="font-semibold">Today's Deals</span>
                </Link>
                
                {isLoggedIn ? (
                  <>
                    {(session.user?.role === 'ADMIN' || session.user?.role === 'SUPER_ADMIN') && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-3 py-3 hover:bg-primary-50 rounded-xl transition-colors text-primary-600"
                        onClick={toggleMobileMenu}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        <span className="font-semibold">Admin Dashboard</span>
                      </Link>
                    )}
                    <Link
                      href="/account"
                      className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                      onClick={toggleMobileMenu}
                    >
                      <User size={24} className="text-gray-600" />
                      <span className="font-medium text-gray-800">My Account</span>
                    </Link>
                    <Link
                      href="/account/orders"
                      className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                      onClick={toggleMobileMenu}
                    >
                      <Package size={24} className="text-gray-600" />
                      <span className="font-medium text-gray-800">My Orders</span>
                    </Link>
                    <Link
                      href="/wishlist"
                      className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                      onClick={toggleMobileMenu}
                    >
                      <Heart size={24} className="text-gray-600" />
                      <span className="font-medium text-gray-800">Wishlist</span>
                    </Link>
                    <button
                      onClick={() => {
                        toggleMobileMenu();
                        signOut({ callbackUrl: '/' });
                      }}
                      className="flex items-center gap-3 px-3 py-3 hover:bg-red-50 rounded-xl transition-colors w-full text-red-600"
                    >
                      <LogOut size={24} />
                      <span className="font-semibold">Sign Out</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-3 px-3 py-3 bg-primary-600 text-white rounded-xl transition-colors"
                    onClick={toggleMobileMenu}
                  >
                    <User size={24} />
                    <span className="font-semibold">Login / Sign Up</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Search Modal */}
      {isSearchOpen && <SearchModal />}

      {/* Cart Sidebar */}
      {isCartOpen && <CartSidebar />}
    </>
  );
}
