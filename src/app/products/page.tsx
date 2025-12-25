'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, Grid3X3, List, ChevronDown, X, SlidersHorizontal, Loader2 } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { Product, SortOption } from '@/types';

interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  originalPrice: number | null;
  discount: number;
  unit: string;
  stockCount: number;
  stockStatus: string;
  isOrganic: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  rating: number;
  averageRating: number;
  reviewCount: number;
  category: { id: string; name: string; slug: string };
  images: { url: string; alt: string | null }[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Transform API product to frontend Product type
function transformProduct(apiProduct: ApiProduct): Product {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    slug: apiProduct.slug,
    description: apiProduct.description || '',
    shortDescription: apiProduct.shortDescription || '',
    category: {
      id: apiProduct.category.id,
      name: apiProduct.category.name,
      slug: apiProduct.category.slug,
      description: '',
      image: '',
      icon: '',
      productCount: 0,
      subcategories: [],
    },
    subcategory: '',
    price: apiProduct.price,
    originalPrice: apiProduct.originalPrice || apiProduct.price,
    discount: apiProduct.discount,
    unit: apiProduct.unit,
    minQuantity: 1,
    maxQuantity: 10,
    stockStatus: apiProduct.stockStatus === 'IN_STOCK' ? 'in-stock' : 
                 apiProduct.stockStatus === 'LOW_STOCK' ? 'limited' : 'out-of-stock',
    stockCount: apiProduct.stockCount,
    images: apiProduct.images.length > 0 
      ? apiProduct.images.map(img => img.url) 
      : ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop'],
    rating: apiProduct.averageRating || apiProduct.rating || 0,
    reviewCount: apiProduct.reviewCount || 0,
    isOrganic: apiProduct.isOrganic,
    isFeatured: apiProduct.isFeatured,
    isNewArrival: apiProduct.isNew,
    isBestSeller: apiProduct.isBestSeller,
    brand: 'KARIM TRADERS',
    origin: 'India',
    tags: apiProduct.tags || [],
    createdAt: apiProduct.createdAt,
    updatedAt: apiProduct.updatedAt,
  };
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams?.get('category') ?? null;
  const searchQuery = searchParams?.get('search') ?? null;
  const featuredParam = searchParams?.get('featured') ?? null;
  const bestsellerParam = searchParams?.get('bestseller') ?? null;
  const newParam = searchParams?.get('new') ?? null;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [isOrganic, setIsOrganic] = useState<boolean | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', limit.toString());
      
      // Filters
      if (selectedCategories.length > 0) {
        params.set('category', selectedCategories[0]);
      }
      if (searchQuery) {
        params.set('search', searchQuery);
      }
      if (priceRange[0] > 0) {
        params.set('minPrice', priceRange[0].toString());
      }
      if (priceRange[1] < 10000) {
        params.set('maxPrice', priceRange[1].toString());
      }
      if (isOrganic === true) {
        params.set('organic', 'true');
      }
      if (inStockOnly) {
        params.set('inStock', 'true');
      }
      if (featuredParam === 'true') {
        params.set('featured', 'true');
      }
      if (bestsellerParam === 'true') {
        params.set('bestseller', 'true');
      }
      
      // Sorting
      if (sortBy === 'price-low-high') {
        params.set('sortBy', 'price');
        params.set('sortOrder', 'asc');
      } else if (sortBy === 'price-high-low') {
        params.set('sortBy', 'price');
        params.set('sortOrder', 'desc');
      } else if (sortBy === 'newest') {
        params.set('sortBy', 'createdAt');
        params.set('sortOrder', 'desc');
      } else if (sortBy === 'discount') {
        params.set('sortBy', 'discount');
      }
      
      const res = await fetch(`/api/products?${params.toString()}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await res.json();
      
      // Transform and filter products
      let transformedProducts = data.products.map(transformProduct);
      
      // Client-side rating filter (API doesn't support this)
      if (minRating > 0) {
        transformedProducts = transformedProducts.filter((p: Product) => p.rating >= minRating);
      }
      
      // Client-side sorting for rating and popularity
      if (sortBy === 'rating') {
        transformedProducts.sort((a: Product, b: Product) => b.rating - a.rating);
      } else if (sortBy === 'popularity') {
        transformedProducts.sort((a: Product, b: Product) => b.reviewCount - a.reviewCount);
      }
      
      setProducts(transformedProducts);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategories, searchQuery, priceRange, isOrganic, inStockOnly, sortBy, minRating, featuredParam, bestsellerParam]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategories, priceRange, isOrganic, inStockOnly, sortBy, searchQuery]);

  const handleCategoryToggle = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [slug]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 10000]);
    setIsOrganic(null);
    setMinRating(0);
    setInStockOnly(false);
    router.push('/products');
  };

  const activeFilterCount = [
    selectedCategories.length > 0,
    priceRange[0] > 0 || priceRange[1] < 10000,
    isOrganic !== null,
    minRating > 0,
    inStockOnly,
  ].filter(Boolean).length;

  const getPageTitle = () => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (featuredParam === 'true') return 'Featured Products';
    if (bestsellerParam === 'true') return 'Best Sellers';
    if (newParam === 'true') return 'New Arrivals';
    if (categoryParam) {
      const category = categories.find((c) => c.slug === categoryParam);
      return category?.name || 'Products';
    }
    return 'All Products';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container-custom py-6">
          <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-800">
            {getPageTitle()}
          </h1>
          <p className="text-gray-600 mt-1">
            {loading ? 'Loading...' : `${total} products found`}
          </p>
        </div>
      </div>

      <div className="container-custom py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-lg">Filters</h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.slug)}
                        onChange={() => handleCategoryToggle(category.slug)}
                        className="filter-checkbox"
                      />
                      <span className="text-gray-700">{category.name}</span>
                      <span className="text-gray-400 text-sm ml-auto">
                        ({category.productCount})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Price Range</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([Number(e.target.value), priceRange[1]])
                    }
                    className="w-24 px-3 py-2 border rounded-lg text-sm"
                    placeholder="Min"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Number(e.target.value)])
                    }
                    className="w-24 px-3 py-2 border rounded-lg text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Organic Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Product Type</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="organic"
                      checked={isOrganic === null}
                      onChange={() => setIsOrganic(null)}
                      className="filter-checkbox"
                    />
                    <span className="text-gray-700">All Products</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="organic"
                      checked={isOrganic === true}
                      onChange={() => setIsOrganic(true)}
                      className="filter-checkbox"
                    />
                    <span className="text-gray-700">Organic Only</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="organic"
                      checked={isOrganic === false}
                      onChange={() => setIsOrganic(false)}
                      className="filter-checkbox"
                    />
                    <span className="text-gray-700">Conventional</span>
                  </label>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Minimum Rating</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label
                      key={rating}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === rating}
                        onChange={() => setMinRating(rating)}
                        className="filter-checkbox"
                      />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
                          >
                            ★
                          </span>
                        ))}
                        <span className="text-gray-700 ml-1">& Up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="filter-checkbox"
                  />
                  <span className="text-gray-700">In Stock Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <SlidersHorizontal size={18} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="popularity">Popularity</option>
                  <option value="newest">Newest First</option>
                  <option value="discount">Discount</option>
                  <option value="rating">Rating</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="hidden md:flex items-center gap-2 border rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategories.map((slug) => (
                  <span
                    key={slug}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    {categories.find((c) => c.slug === slug)?.name}
                    <button onClick={() => handleCategoryToggle(slug)}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
                {isOrganic !== null && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {isOrganic ? 'Organic' : 'Conventional'}
                    <button onClick={() => setIsOrganic(null)}>
                      <X size={14} />
                    </button>
                  </span>
                )}
                {minRating > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {minRating}+ Stars
                    <button onClick={() => setMinRating(0)}>
                      <X size={14} />
                    </button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    In Stock
                    <button onClick={() => setInStockOnly(false)}>
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X size={40} className="text-red-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">{error}</h3>
                <button onClick={fetchProducts} className="btn-primary mt-4">
                  Try Again
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && products.length > 0 && (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'
                      : 'space-y-4'
                  }
                >
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-lg ${
                            page === pageNum
                              ? 'bg-primary-600 text-white'
                              : 'border hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}

            {/* No Products */}
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter size={40} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <button onClick={clearAllFilters} className="btn-primary">
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-lg">Filters</h2>
              <button onClick={() => setShowFilters(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.slug)}
                        onChange={() => handleCategoryToggle(category.slug)}
                        className="filter-checkbox"
                      />
                      <span className="text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Price Range</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([Number(e.target.value), priceRange[1]])
                    }
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    placeholder="Min"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Number(e.target.value)])
                    }
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Stock Filter */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="filter-checkbox"
                  />
                  <span className="text-gray-700">In Stock Only</span>
                </label>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white p-4 border-t flex gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 btn-outline"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
