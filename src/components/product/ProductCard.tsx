'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Star, Eye, Plus, Minus, Zap, Leaf, Clock, ChevronDown } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Product } from '@/types';
import { useCartStore, useWishlistStore } from '@/store';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  showQuickAdd?: boolean;
  variant?: 'default' | 'compact' | 'horizontal';
}

export default function ProductCard({ product, showQuickAdd = true, variant = 'default' }: ProductCardProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  const [isHovered, setIsHovered] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showQuantity, setShowQuantity] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState(product.unit || '1 kg');
  const { addItem, syncAddItem, items } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  
  const isWishlisted = isInWishlist(product.id);
  const cartItem = items.find(item => item.product.id === product.id);
  const isInCart = !!cartItem;

  // Weight variants (simulated - in real app, this would come from product data)
  const weightVariants = ['500g', '1 kg', '2 kg'];

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (userId) {
      const success = await syncAddItem(product, quantity, userId);
      if (success) {
        toast.success(`${product.name} added to cart!`);
        setShowQuantity(true);
      } else {
        toast.error('Failed to add to cart');
      }
    } else {
      addItem(product, quantity);
      toast.success(`${product.name} added to cart!`);
      setShowQuantity(true);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist!');
    }
  };

  const stockStatusConfig = {
    'in-stock': { text: 'In Stock', class: 'bg-green-100 text-green-700' },
    'limited': { text: 'Only Few Left', class: 'bg-orange-100 text-orange-700' },
    'out-of-stock': { text: 'Out of Stock', class: 'bg-gray-100 text-gray-500' },
  };

  // Compact variant for grids with more products
  if (variant === 'compact') {
    return (
      <Link href={`/products/${product.slug}`}>
        <div className="card group relative bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all">
          {/* Badges */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {product.discount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                {product.discount}% OFF
              </span>
            )}
          </div>

          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-gray-50 p-2">
            <Image
              src={product.images[0] || '/placeholder-product.png'}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Info */}
          <div className="p-3">
            <h3 className="font-medium text-gray-800 text-sm line-clamp-1 mb-1">{product.name}</h3>
            <p className="text-xs text-gray-500 mb-2">{product.unit}</p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary-600">₹{product.price}</span>
              <button
                onClick={handleAddToCart}
                className="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center hover:bg-primary-700"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/products/${product.slug}`}>
      <div 
        className="card card-hover group relative bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-primary-200 transition-all"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Badges - Top Left */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10 flex flex-col gap-1">
          {product.discount > 0 && (
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
              {product.discount}% OFF
            </span>
          )}
          {product.isOrganic && (
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
              <Leaf size={10} /> Organic
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
              NEW
            </span>
          )}
        </div>

        {/* Express Badge - Top Center */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-yellow-400 text-yellow-900 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
            <Zap size={10} /> EXPRESS
          </span>
        </div>

        {/* Wishlist Button - Top Right */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 sm:top-3 right-2 sm:right-3 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
            isWishlisted 
              ? 'bg-red-500 text-white scale-110' 
              : 'bg-white text-gray-400 hover:text-red-500 hover:scale-110'
          }`}
        >
          <Heart size={16} className="sm:w-[18px] sm:h-[18px]" fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-gray-50 to-white p-3 sm:p-4">
          <Image
            src={product.images[0] || '/placeholder-product.png'}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Quick View on Hover */}
          <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <button 
              className="bg-white/95 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg hover:bg-primary-600 hover:text-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Eye size={14} /> Quick View
            </button>
          </div>

          {/* Out of Stock Overlay */}
          {product.stockStatus === 'out-of-stock' && (
            <div className="absolute inset-0 bg-white/90 flex items-center justify-center backdrop-blur-sm">
              <span className="bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 sm:p-4">
          {/* Delivery Time */}
          <div className="flex items-center gap-1 text-primary-600 text-[10px] sm:text-xs font-medium mb-1.5">
            <Clock size={12} />
            <span>Delivery in 10-30 mins</span>
          </div>

          {/* Category */}
          <p className="text-[10px] sm:text-xs text-gray-400 font-medium mb-0.5 uppercase tracking-wide">
            {product.category.name}
          </p>
          
          {/* Name */}
          <h3 className="font-semibold text-gray-800 mb-1.5 line-clamp-2 min-h-[36px] sm:min-h-[44px] text-sm sm:text-base group-hover:text-primary-600 transition-colors leading-tight">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1 bg-green-600 text-white px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-bold">
              <span>{product.rating}</span>
              <Star size={10} fill="currentColor" />
            </div>
            <span className="text-[10px] sm:text-xs text-gray-400">({product.reviewCount} reviews)</span>
          </div>

          {/* Weight Selector */}
          <div className="relative mb-2">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-700 hover:border-primary-300 transition-colors"
            >
              <span>{selectedWeight}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg sm:text-xl font-bold text-gray-800">₹{product.price}</span>
            {product.discount > 0 && (
              <>
                <span className="text-xs sm:text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                <span className="text-xs text-green-600 font-semibold">Save ₹{product.originalPrice - product.price}</span>
              </>
            )}
          </div>

          {/* Add to Cart Section */}
          {showQuickAdd && product.stockStatus !== 'out-of-stock' && (
            <>
              {isInCart || showQuantity ? (
                // Quantity Controls when in cart
                <div className="flex items-center justify-center border-2 border-primary-600 rounded-lg overflow-hidden">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (quantity > 1) setQuantity(quantity - 1);
                      else setShowQuantity(false);
                    }}
                    className="flex-1 py-2.5 bg-primary-50 hover:bg-primary-100 text-primary-600 font-bold transition-colors"
                  >
                    <Minus size={18} className="mx-auto" />
                  </button>
                  <span className="flex-1 py-2.5 text-center font-bold text-primary-600 text-lg">
                    {cartItem?.quantity || quantity}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setQuantity(Math.min(product.maxQuantity || 10, quantity + 1));
                    }}
                    className="flex-1 py-2.5 bg-primary-50 hover:bg-primary-100 text-primary-600 font-bold transition-colors"
                  >
                    <Plus size={18} className="mx-auto" />
                  </button>
                </div>
              ) : (
                // Add to Cart Button
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-2.5 sm:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  <ShoppingCart size={18} />
                  <span>Add to Cart</span>
                </button>
              )}
            </>
          )}

          {/* Stock Status for limited stock */}
          {product.stockStatus === 'limited' && (
            <p className="text-center text-orange-600 text-xs font-medium mt-2 flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              Only few left in stock!
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
