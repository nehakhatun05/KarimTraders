'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, TrendingUp, ArrowRight, Loader2, Tag } from 'lucide-react';
import { useSearchStore } from '@/store';
import Link from 'next/link';

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  discount: number;
  image: string | null;
  category: string | null;
  categorySlug: string | null;
  stockStatus: string;
}

interface SearchCategory {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  productCount: number;
}

interface SearchResults {
  products: SearchProduct[];
  categories: SearchCategory[];
  suggestions: string[];
}

export default function SearchModal() {
  const { query, setQuery, recentSearches, addRecentSearch, toggleSearch } = useSearchStore();
  const [results, setResults] = useState<SearchResults>({ products: [], categories: [], suggestions: [] });
  const [loading, setLoading] = useState(false);
  const [dbCategories, setDbCategories] = useState<SearchCategory[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        // API returns array directly
        const cats = Array.isArray(data) ? data : (data.categories || []);
        setDbCategories(cats.slice(0, 8).map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          image: c.image,
          productCount: c.productCount || c._count?.products || 0
        })));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults({ products: [], categories: [], suggestions: [] });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
      if (res.ok) {
        const data = await res.json();
        setResults({
          products: data.products || [],
          categories: data.categories || [],
          suggestions: data.suggestions || [],
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchProducts(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchProducts]);

  const handleSearch = (searchTerm: string) => {
    addRecentSearch(searchTerm);
    toggleSearch();
    window.location.href = `/products?search=${encodeURIComponent(searchTerm)}`;
  };

  const popularSearches = ['Fruits', 'Vegetables', 'Dry Fruits', 'Spices', 'Organic'];

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 animate-fade-in">
      <div className="bg-white w-full max-w-3xl mx-auto mt-0 md:mt-20 md:rounded-xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Search className="text-gray-400" size={24} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for fruits, vegetables, spices..."
            className="flex-1 text-lg outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query) {
                handleSearch(query);
              }
            }}
          />
          {loading && <Loader2 className="animate-spin text-gray-400" size={20} />}
          <button
            onClick={toggleSearch}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Search Results */}
          {query.length >= 2 && (results.products.length > 0 || results.categories.length > 0) && (
            <div className="p-4">
              {/* Category Results */}
              {results.categories.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                    <Tag size={16} />
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {results.categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/products?category=${category.slug}`}
                        onClick={() => {
                          addRecentSearch(category.name);
                          toggleSearch();
                        }}
                        className="px-4 py-2 bg-primary-50 hover:bg-primary-100 rounded-full text-sm font-medium text-primary-700 transition-colors"
                      >
                        {category.name} ({category.productCount})
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Results */}
              {results.products.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">Products</h3>
                  <div className="space-y-2">
                    {results.products.slice(0, 6).map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => {
                          addRecentSearch(product.name);
                          toggleSearch();
                        }}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Search size={20} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.category || 'Uncategorized'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary-600">₹{product.price}</p>
                          {product.discount > 0 && product.originalPrice && (
                            <p className="text-xs text-gray-400 line-through">₹{product.originalPrice}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                  {results.products.length > 6 && (
                    <button
                      onClick={() => handleSearch(query)}
                      className="w-full mt-3 py-3 text-primary-600 font-medium hover:bg-primary-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      View all {results.products.length} results
                      <ArrowRight size={18} />
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* No Results */}
          {query.length >= 2 && !loading && results.products.length === 0 && results.categories.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500">No products found for "{query}"</p>
              <p className="text-sm text-gray-400 mt-1">Try searching with different keywords</p>
            </div>
          )}

          {/* Loading State */}
          {query.length >= 2 && loading && results.products.length === 0 && (
            <div className="p-8 text-center">
              <Loader2 className="animate-spin mx-auto text-primary-600 mb-2" size={32} />
              <p className="text-gray-500">Searching...</p>
            </div>
          )}

          {/* Recent Searches & Popular */}
          {query.length < 2 && (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="p-4 border-b">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                    <Clock size={16} />
                    Recent Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.slice(0, 5).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div className="p-4 border-b">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                  <TrendingUp size={16} />
                  Popular Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => handleSearch(search)}
                      className="px-4 py-2 bg-primary-50 hover:bg-primary-100 rounded-full text-sm font-medium text-primary-700 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>

              {/* Browse Categories from Database */}
              {dbCategories.length > 0 && (
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">Browse Categories</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {dbCategories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/products?category=${category.slug}`}
                        onClick={toggleSearch}
                        className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {category.image ? (
                          <img 
                            src={category.image} 
                            alt={category.name} 
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
                            <Tag size={16} className="text-primary-600" />
                          </div>
                        )}
                        <span className="font-medium text-gray-700 text-sm truncate">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
