'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-[180px] font-bold text-gray-100 leading-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">🥕</div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Oops! Page Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          Looks like this page went grocery shopping and got lost! 
          Don't worry, let's help you find your way back.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/"
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Go to Homepage
          </Link>
          <Link
            href="/products"
            className="btn-outline flex items-center justify-center gap-2"
          >
            <ShoppingBag size={18} />
            Browse Products
          </Link>
        </div>

        {/* Search Suggestion */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-4">Or try searching for what you need:</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Help Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
          <Link href="/help" className="text-primary-600 hover:underline">
            Help Center
          </Link>
          <Link href="/contact" className="text-primary-600 hover:underline">
            Contact Us
          </Link>
          <Link href="/categories" className="text-primary-600 hover:underline">
            Categories
          </Link>
        </div>
      </div>
    </div>
  );
}
