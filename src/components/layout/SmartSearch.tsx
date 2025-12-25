'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, TrendingUp, ArrowRight, Loader2, Tag, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchSuggestion {
  type: 'product' | 'category' | 'search';
  id: string;
  name: string;
  image?: string;
  price?: number;
  originalPrice?: number;
  category?: string;
  href: string;
}

const trendingSearches = [
  'Fresh apples',
  'Organic vegetables',
  'Almonds',
  'Turmeric powder',
  'Bananas',
  'Mixed dry fruits',
];

const popularCategories = [
  { name: 'Fresh Fruits', href: '/products?category=cat-1', color: 'bg-red-100 text-red-700' },
  { name: 'Fresh Vegetables', href: '/products?category=cat-2', color: 'bg-green-100 text-green-700' },
  { name: 'Dry Fruits & Nuts', href: '/products?category=cat-3', color: 'bg-amber-100 text-amber-700' },
  { name: 'Spices & Seasonings', href: '/products?category=cat-4', color: 'bg-orange-100 text-orange-700' },
];

export default function SmartSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    async function fetchSuggestions() {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          // Map API response to our format
          const mappedSuggestions = (data.products || []).map((p: any) => ({
            type: 'product' as const,
            id: p.id,
            name: p.name,
            image: p.image,
            price: p.price,
            originalPrice: p.originalPrice,
            category: p.category,
            href: `/products/${p.slug}`,
          }));
          setSuggestions(mappedSuggestions);
        }
      } catch (error) {
        console.error('Search error:', error);
      }
      setIsLoading(false);
    }

    fetchSuggestions();
  }, [debouncedQuery]);

  const saveRecentSearch = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = (searchTerm?: string) => {
    const term = searchTerm || query;
    if (!term.trim()) return;
    
    saveRecentSearch(term);
    setIsOpen(false);
    router.push(`/products?search=${encodeURIComponent(term)}`);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        router.push(suggestions[selectedIndex].href);
        setIsOpen(false);
      } else {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    }
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-2xl">
      {/* Search Input */}
      <div className={`relative flex items-center transition-all ${
        isFocused 
          ? 'ring-2 ring-primary-500 shadow-lg' 
          : 'ring-1 ring-gray-200 hover:ring-gray-300'
      } bg-white rounded-xl overflow-hidden`}>
        <Search size={20} className="absolute left-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            setIsFocused(true);
            setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Search for groceries, fruits, vegetables..."
          className="w-full py-3 pl-12 pr-24 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
        />
        
        {/* Clear & Search Button */}
        <div className="absolute right-2 flex items-center gap-2">
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1.5 hover:bg-gray-100 rounded-full"
            >
              <X size={16} className="text-gray-400" />
            </button>
          )}
          <button
            onClick={() => handleSearch()}
            className="px-4 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-primary-600" />
            </div>
          )}

          {/* Search Suggestions */}
          {!isLoading && suggestions.length > 0 && (
            <div className="py-2">
              <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                Products
              </p>
              {suggestions.map((suggestion, index) => (
                <Link
                  key={suggestion.id}
                  href={suggestion.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                    index === selectedIndex ? 'bg-gray-50' : ''
                  }`}
                >
                  {suggestion.image ? (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={suggestion.image}
                        alt={suggestion.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package size={20} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{suggestion.name}</p>
                    {suggestion.category && (
                      <p className="text-xs text-gray-500">in {suggestion.category}</p>
                    )}
                  </div>
                  {suggestion.price && (
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">₹{suggestion.price}</p>
                      {suggestion.originalPrice && suggestion.originalPrice > suggestion.price && (
                        <p className="text-xs text-gray-400 line-through">₹{suggestion.originalPrice}</p>
                      )}
                    </div>
                  )}
                </Link>
              ))}
              <Link
                href={`/products?search=${encodeURIComponent(query)}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 text-primary-600 font-medium hover:bg-primary-50 border-t border-gray-100"
              >
                View all results for "{query}"
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {/* Empty State with Trends & Recent */}
          {!isLoading && suggestions.length === 0 && (
            <div className="py-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between px-4 py-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                      <Clock size={14} />
                      Recent Searches
                    </p>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 px-4">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setQuery(term);
                          handleSearch(term);
                        }}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div className="mb-4">
                <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                  <TrendingUp size={14} />
                  Trending Searches
                </p>
                <div className="flex flex-wrap gap-2 px-4">
                  {trendingSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setQuery(term);
                        handleSearch(term);
                      }}
                      className="px-3 py-1.5 bg-orange-50 text-orange-700 text-sm rounded-full hover:bg-orange-100 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Categories */}
              <div>
                <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                  <Tag size={14} />
                  Popular Categories
                </p>
                <div className="flex flex-wrap gap-2 px-4 pb-2">
                  {popularCategories.map((cat) => (
                    <Link
                      key={cat.name}
                      href={cat.href}
                      onClick={() => setIsOpen(false)}
                      className={`px-3 py-1.5 text-sm rounded-full ${cat.color} hover:opacity-80 transition-opacity`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
