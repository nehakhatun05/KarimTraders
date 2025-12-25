'use client';

import Link from 'next/link';
import { categories } from '@/data';
import { ArrowRight } from 'lucide-react';

export default function CategorySection() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Browse our wide range of fresh products</p>
          </div>
          <Link 
            href="/products" 
            className="hidden md:flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
          >
            View All
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group relative overflow-hidden rounded-xl sm:rounded-2xl aspect-[4/3] card-hover"
            >
              {/* Background Image */}
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl md:text-4xl">{category.icon}</span>
                  <div>
                    <h3 className="text-sm sm:text-lg md:text-xl font-semibold text-white group-hover:text-primary-300 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70">{category.productCount} Products</p>
                  </div>
                </div>
              </div>

              {/* Hover Arrow */}
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-7 h-7 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                <ArrowRight className="text-white" size={16} />
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile View All Link */}
        <div className="mt-6 md:hidden">
          <Link 
            href="/products" 
            className="w-full btn-outline flex items-center justify-center gap-2"
          >
            View All Categories
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
