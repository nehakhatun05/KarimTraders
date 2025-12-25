'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ArrowRight, Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  _count?: { products: number };
  products?: any[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    fetchCategories();
    fetchTotalProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?includeProducts=true&productLimit=4');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=1');
      const data = await res.json();
      setTotalProducts(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching total products:', error);
    }
  };

  const getCategoryGradient = (slug: string) => {
    const gradients: Record<string, string> = {
      'fresh-fruits': 'from-red-500 to-orange-500',
      'fruits': 'from-red-500 to-orange-500',
      'fresh-vegetables': 'from-green-500 to-emerald-500',
      'vegetables': 'from-green-500 to-emerald-500',
      'dry-fruits': 'from-amber-500 to-yellow-500',
      'dry-fruits-nuts': 'from-amber-500 to-yellow-500',
      'spices': 'from-orange-500 to-red-500',
      'spices-seasonings': 'from-orange-500 to-red-500',
    };
    return gradients[slug] || 'from-primary-500 to-primary-600';
  };

  const getCategoryIcon = (slug: string, icon?: string) => {
    if (icon) return icon;
    const icons: Record<string, string> = {
      'fresh-fruits': '🍎',
      'fruits': '🍎',
      'fresh-vegetables': '🥬',
      'vegetables': '🥬',
      'dry-fruits': '🥜',
      'dry-fruits-nuts': '🥜',
      'spices': '🌶️',
      'spices-seasonings': '🌶️',
    };
    return icons[slug] || '📦';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
        <div className="container-custom">
          <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={16} />
            <span className="text-white">Categories</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Shop by Category</h1>
          <p className="text-white/80">
            Explore our wide range of fresh groceries, organized just for you
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {categories.map((category) => {
            const categoryProducts = category.products || [];
            
            return (
              <div key={category.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group">
                {/* Category Header */}
                <div className={`p-6 bg-gradient-to-r ${getCategoryGradient(category.slug)} text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{getCategoryIcon(category.slug, category.icon)}</span>
                      <div>
                        <h2 className="text-2xl font-bold">{category.name}</h2>
                        <p className="text-white/80 text-sm">{category._count?.products || 0} Products</p>
                      </div>
                    </div>
                    <Link 
                      href={`/products?category=${category.slug}`}
                      className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    >
                      <ArrowRight size={24} />
                    </Link>
                  </div>
                </div>

                {/* Category Description */}
                <div className="p-6 border-b">
                  <p className="text-gray-600">{category.description || `Explore our ${category.name.toLowerCase()} collection`}</p>
                </div>

                {/* Sample Products */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Popular in {category.name}</h3>
                    <Link 
                      href={`/products?category=${category.slug}`}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                  {categoryProducts.length > 0 ? (
                    <div className="grid grid-cols-4 gap-3">
                      {categoryProducts.map((product: any) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          className="group/item"
                        >
                          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-2">
                            <img
                              src={product.images?.[0]?.url || '/images/placeholder-product.png'}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <p className="text-xs text-gray-600 truncate">{product.name}</p>
                          <p className="text-sm font-semibold text-gray-800">₹{product.price}</p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No products available yet</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories available</p>
          </div>
        )}

        {/* Browse All Products CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Can't find what you're looking for?</h2>
          <p className="text-gray-600 mb-6">Browse our complete collection of {totalProducts}+ products</p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            Browse All Products
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Category Benefits */}
        <div className="mt-12 grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-primary-100 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">🌿</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">100% Fresh</h3>
            <p className="text-sm text-gray-500">Farm-fresh produce delivered to your doorstep</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-primary-100 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Quality Assured</h3>
            <p className="text-sm text-gray-500">Rigorous quality checks at every step</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-primary-100 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">🚚</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Fast Delivery</h3>
            <p className="text-sm text-gray-500">Same-day delivery available</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-primary-100 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">💰</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Best Prices</h3>
            <p className="text-sm text-gray-500">Competitive prices, great value</p>
          </div>
        </div>
      </div>
    </div>
  );
}
