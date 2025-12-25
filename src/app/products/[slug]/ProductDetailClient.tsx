'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronRight, 
  Heart, 
  ShoppingCart, 
  Share2, 
  Star, 
  Minus, 
  Plus,
  Truck,
  Shield,
  RotateCcw,
  MapPin,
  Check,
  Info
} from 'lucide-react';
import { useCartStore, useWishlistStore } from '@/store';
import { useSession } from 'next-auth/react';
import ProductCard from '@/components/product/ProductCard';
import toast from 'react-hot-toast';

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  images: string[];
  price: number;
  originalPrice: number;
  discount: number;
  unit: string;
  stock: number;
  stockStatus: string;
  rating: number;
  reviewCount: number;
  isOrganic: boolean;
  nutritionInfo?: any;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ReviewData {
  id: string;
  rating: number;
  title: string;
  comment: string;
  userName: string;
  userImage?: string;
  createdAt: string;
  isVerifiedPurchase: boolean;
}

interface ProductDetailClientProps {
  product: ProductData;
  relatedProducts: any[];
  reviews: ReviewData[];
}

export default function ProductDetailClient({ 
  product, 
  relatedProducts, 
  reviews 
}: ProductDetailClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'nutrition' | 'reviews'>('description');
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState<string | null>(null);

  const { addItem, syncAddItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  const isWishlisted = isInWishlist(product.id);
  const maxQuantity = Math.min(product.stock, 10);

  const handleAddToCart = async () => {
    const cartProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      images: product.images,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      unit: product.unit,
      stockStatus: product.stockStatus as any,
      rating: product.rating,
      reviewCount: product.reviewCount,
      isOrganic: product.isOrganic,
      category: product.category,
    };

    if (userId) {
      const success = await syncAddItem(cartProduct as any, quantity, userId);
      if (success) {
        toast.success(`${product.name} added to cart!`);
      } else {
        toast.error('Failed to add to cart');
      }
    } else {
      addItem(cartProduct as any, quantity);
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      const wishlistProduct = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        images: product.images,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        unit: product.unit,
        stockStatus: product.stockStatus as any,
        rating: product.rating,
        reviewCount: product.reviewCount,
        isOrganic: product.isOrganic,
        category: product.category,
      };
      addToWishlist(wishlistProduct as any);
      toast.success('Added to wishlist!');
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/checkout');
  };

  const checkDelivery = () => {
    if (pincode.length === 6) {
      setDeliveryInfo('Delivery available in 2-3 days');
    } else {
      toast.error('Please enter a valid 6-digit pincode');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} at KARIM TRADERS`,
          url,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
            <Link href="/" className="text-gray-500 hover:text-primary-600">
              Home
            </Link>
            <ChevronRight size={16} className="text-gray-400" aria-hidden="true" />
            <Link href="/products" className="text-gray-500 hover:text-primary-600">
              Products
            </Link>
            <ChevronRight size={16} className="text-gray-400" aria-hidden="true" />
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-gray-500 hover:text-primary-600"
            >
              {product.category.name}
            </Link>
            <ChevronRight size={16} className="text-gray-400" aria-hidden="true" />
            <span className="text-gray-800 font-medium" aria-current="page">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div>
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
                <Image
                  src={product.images[selectedImage] || '/placeholder-product.png'}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.discount > 0 && (
                    <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
                      {product.discount}% OFF
                    </span>
                  )}
                  {product.isOrganic && (
                    <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded">
                      Organic
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="flex gap-3" role="listbox" aria-label="Product images">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index
                          ? 'border-primary-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      aria-selected={selectedImage === index}
                      aria-label={`View image ${index + 1}`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {/* Category */}
              <Link
                href={`/products?category=${product.category.slug}`}
                className="text-primary-600 text-sm font-medium hover:text-primary-700"
              >
                {product.category.name}
              </Link>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mt-2 mb-3">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <div className="flex" aria-label={`Rating: ${product.rating} out of 5 stars`}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <span className="font-medium text-gray-800">{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-500">({product.reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-primary-600">₹{product.price}</span>
                {product.discount > 0 && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      ₹{product.originalPrice}
                    </span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">
                      Save ₹{(product.originalPrice - product.price).toFixed(0)}
                    </span>
                  </>
                )}
              </div>

              {/* Unit */}
              <p className="text-gray-600 mb-4">
                Price per {product.unit}
              </p>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stockStatus === 'in-stock' && (
                  <span className="inline-flex items-center gap-2 text-green-600">
                    <Check size={18} aria-hidden="true" />
                    In Stock ({product.stock} available)
                  </span>
                )}
                {product.stockStatus === 'limited' && (
                  <span className="inline-flex items-center gap-2 text-orange-600">
                    <Info size={18} aria-hidden="true" />
                    Limited Stock - Only {product.stock} left!
                  </span>
                )}
                {product.stockStatus === 'out-of-stock' && (
                  <span className="inline-flex items-center gap-2 text-red-600">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className="text-gray-600 mb-6">{product.shortDescription}</p>

              {/* Quantity Selector */}
              {product.stockStatus !== 'out-of-stock' && (
                <div className="mb-6">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 hover:bg-gray-100 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={18} aria-hidden="true" />
                      </button>
                      <input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setQuantity(Math.max(1, Math.min(maxQuantity, val)));
                        }}
                        className="w-12 text-center font-medium border-0 focus:ring-0"
                        min={1}
                        max={maxQuantity}
                      />
                      <button
                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                        className="p-3 hover:bg-gray-100 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={18} aria-hidden="true" />
                      </button>
                    </div>
                    <span className="text-gray-500 text-sm">
                      Max: {maxQuantity} {product.unit}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                {product.stockStatus !== 'out-of-stock' ? (
                  <>
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={20} aria-hidden="true" />
                      Add to Cart
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2"
                    >
                      Buy Now
                    </button>
                  </>
                ) : (
                  <button 
                    className="flex-1 bg-gray-300 text-gray-600 py-3 px-6 rounded-lg cursor-not-allowed"
                    disabled
                  >
                    Out of Stock
                  </button>
                )}
                <button
                  onClick={handleWishlistToggle}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    isWishlisted
                      ? 'bg-red-50 border-red-500 text-red-500'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} aria-hidden="true" />
                </button>
                <button 
                  onClick={handleShare}
                  className="p-3 rounded-lg border-2 border-gray-300 text-gray-600 hover:border-gray-400"
                  aria-label="Share product"
                >
                  <Share2 size={20} aria-hidden="true" />
                </button>
              </div>

              {/* Delivery Check */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={18} className="text-primary-600" aria-hidden="true" />
                  <span className="font-medium">Check Delivery</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter pincode"
                    className="flex-1 input-field"
                    maxLength={6}
                    aria-label="Enter pincode for delivery check"
                  />
                  <button onClick={checkDelivery} className="btn-outline">
                    Check
                  </button>
                </div>
                {deliveryInfo && (
                  <p className="text-green-600 text-sm mt-2 flex items-center gap-2">
                    <Check size={16} aria-hidden="true" />
                    {deliveryInfo}
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Truck className="mx-auto text-primary-600 mb-2" size={24} aria-hidden="true" />
                  <p className="text-xs text-gray-600">Free Delivery</p>
                  <p className="text-xs text-gray-500">Above ₹500</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Shield className="mx-auto text-primary-600 mb-2" size={24} aria-hidden="true" />
                  <p className="text-xs text-gray-600">Quality Assured</p>
                  <p className="text-xs text-gray-500">100% Fresh</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <RotateCcw className="mx-auto text-primary-600 mb-2" size={24} aria-hidden="true" />
                  <p className="text-xs text-gray-600">Easy Returns</p>
                  <p className="text-xs text-gray-500">7 Day Policy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t">
            <div className="flex border-b" role="tablist">
              {[
                { id: 'description', label: 'Description' },
                { id: 'nutrition', label: 'Nutrition Info' },
                { id: 'reviews', label: `Reviews (${reviews.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`${tab.id}-panel`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Description Tab */}
              {activeTab === 'description' && (
                <div id="description-panel" role="tabpanel" className="prose max-w-none">
                  <p className="text-gray-700 mb-4">{product.description}</p>
                </div>
              )}

              {/* Nutrition Tab */}
              {activeTab === 'nutrition' && (
                <div id="nutrition-panel" role="tabpanel">
                  {product.nutritionInfo ? (
                    <div className="max-w-md">
                      <h4 className="font-semibold text-gray-800 mb-4">Nutritional Information (per 100g)</h4>
                      <div className="space-y-3">
                        {[
                          { label: 'Calories', value: `${product.nutritionInfo.calories} kcal` },
                          { label: 'Protein', value: `${product.nutritionInfo.protein}g` },
                          { label: 'Carbohydrates', value: `${product.nutritionInfo.carbs}g` },
                          { label: 'Fat', value: `${product.nutritionInfo.fat}g` },
                          { label: 'Fiber', value: `${product.nutritionInfo.fiber}g` },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="flex justify-between py-2 border-b"
                          >
                            <span className="text-gray-600">{item.label}</span>
                            <span className="font-medium text-gray-800">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Nutritional information not available for this product.</p>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div id="reviews-panel" role="tabpanel">
                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <article key={review.id} className="border-b pb-6">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-primary-600 font-medium">
                                {review.userName.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-800">{review.userName}</span>
                                {review.isVerifiedPurchase && (
                                  <span className="badge badge-success text-xs">
                                    Verified Purchase
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex" aria-label={`Rating: ${review.rating} out of 5`}>
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={14}
                                      className={
                                        i < review.rating
                                          ? 'text-yellow-400 fill-yellow-400'
                                          : 'text-gray-300'
                                      }
                                      aria-hidden="true"
                                    />
                                  ))}
                                </div>
                                <time className="text-sm text-gray-500" dateTime={review.createdAt}>
                                  {new Date(review.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                </time>
                              </div>
                              {review.title && (
                                <h4 className="font-medium text-gray-800 mb-1">{review.title}</h4>
                              )}
                              <p className="text-gray-600">{review.comment}</p>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No reviews yet. Be the first to review!</p>
                      <Link href={`/products/${product.slug}/review`} className="btn-primary">
                        Write a Review
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12" aria-labelledby="related-products-heading">
            <h2 id="related-products-heading" className="section-title mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
