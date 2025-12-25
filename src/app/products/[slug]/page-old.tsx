'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { getProductBySlug, products, reviews } from '@/data';
import { useCartStore, useWishlistStore } from '@/store';
import ProductCard from '@/components/product/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string || '';
  const product = getProductBySlug(slug);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'nutrition' | 'reviews'>('description');
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState<string | null>(null);

  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
          <Link href="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const productReviews = reviews.filter((r) => r.productId === product.id);
  const relatedProducts = products
    .filter((p) => p.category.id === product.category.id && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist!');
    }
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push('/checkout');
  };

  const checkDelivery = () => {
    if (pincode.length === 6) {
      setDeliveryInfo('Delivery available in 2-3 days');
    } else {
      toast.error('Please enter a valid 6-digit pincode');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-primary-600">
              Home
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <Link href="/products" className="text-gray-500 hover:text-primary-600">
              Products
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-gray-500 hover:text-primary-600"
            >
              {product.category.name}
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-800 font-medium">{product.name}</span>
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
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
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
                <div className="flex gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index
                          ? 'border-primary-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
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
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                  <span className="font-medium text-gray-800">{product.rating}</span>
                </div>
                <span className="text-gray-500">({product.reviewCount} reviews)</span>
                <button className="text-primary-600 text-sm hover:underline">
                  Write a Review
                </button>
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
                      Save ₹{product.originalPrice - product.price}
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
                    <Check size={18} />
                    In Stock ({product.stockCount} available)
                  </span>
                )}
                {product.stockStatus === 'limited' && (
                  <span className="inline-flex items-center gap-2 text-orange-600">
                    <Info size={18} />
                    Limited Stock - Only {product.stockCount} left!
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 hover:bg-gray-100 transition-colors"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <button
                        onClick={() =>
                          setQuantity(Math.min(product.maxQuantity, quantity + 1))
                        }
                        className="p-3 hover:bg-gray-100 transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <span className="text-gray-500 text-sm">
                      Max: {product.maxQuantity} {product.unit}
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
                      <ShoppingCart size={20} />
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
                  <button className="flex-1 bg-gray-300 text-gray-600 py-3 px-6 rounded-lg cursor-not-allowed">
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
                >
                  <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
                <button className="p-3 rounded-lg border-2 border-gray-300 text-gray-600 hover:border-gray-400">
                  <Share2 size={20} />
                </button>
              </div>

              {/* Delivery Check */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={18} className="text-primary-600" />
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
                  />
                  <button onClick={checkDelivery} className="btn-outline">
                    Check
                  </button>
                </div>
                {deliveryInfo && (
                  <p className="text-green-600 text-sm mt-2 flex items-center gap-2">
                    <Check size={16} />
                    {deliveryInfo}
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Truck className="mx-auto text-primary-600 mb-2" size={24} />
                  <p className="text-xs text-gray-600">Free Delivery</p>
                  <p className="text-xs text-gray-500">Above ₹500</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Shield className="mx-auto text-primary-600 mb-2" size={24} />
                  <p className="text-xs text-gray-600">Quality Assured</p>
                  <p className="text-xs text-gray-500">100% Fresh</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <RotateCcw className="mx-auto text-primary-600 mb-2" size={24} />
                  <p className="text-xs text-gray-600">Easy Returns</p>
                  <p className="text-xs text-gray-500">7 Day Policy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t">
            <div className="flex border-b">
              {[
                { id: 'description', label: 'Description' },
                { id: 'nutrition', label: 'Nutrition Info' },
                { id: 'reviews', label: `Reviews (${productReviews.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Description Tab */}
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 mb-4">{product.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Product Details</h4>
                      <dl className="space-y-2">
                        <div className="flex">
                          <dt className="w-32 text-gray-500">Brand:</dt>
                          <dd className="text-gray-800">{product.brand}</dd>
                        </div>
                        <div className="flex">
                          <dt className="w-32 text-gray-500">Origin:</dt>
                          <dd className="text-gray-800">{product.origin}</dd>
                        </div>
                        <div className="flex">
                          <dt className="w-32 text-gray-500">Shelf Life:</dt>
                          <dd className="text-gray-800">{product.shelfLife}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    {product.storageInstructions && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Storage Instructions</h4>
                        <p className="text-gray-700">{product.storageInstructions}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Nutrition Tab */}
              {activeTab === 'nutrition' && (
                <div>
                  {product.nutritionalInfo ? (
                    <div className="max-w-md">
                      <h4 className="font-semibold text-gray-800 mb-4">Nutritional Information (per 100g)</h4>
                      <div className="space-y-3">
                        {[
                          { label: 'Calories', value: `${product.nutritionalInfo.calories} kcal` },
                          { label: 'Protein', value: `${product.nutritionalInfo.protein}g` },
                          { label: 'Carbohydrates', value: `${product.nutritionalInfo.carbs}g` },
                          { label: 'Fat', value: `${product.nutritionalInfo.fat}g` },
                          { label: 'Fiber', value: `${product.nutritionalInfo.fiber}g` },
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
                      {product.nutritionalInfo.vitamins && (
                        <div className="mt-4">
                          <h5 className="font-medium text-gray-800 mb-2">Key Vitamins & Minerals</h5>
                          <div className="flex flex-wrap gap-2">
                            {product.nutritionalInfo.vitamins.map((vitamin) => (
                              <span
                                key={vitamin}
                                className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                              >
                                {vitamin}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">Nutritional information not available for this product.</p>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div>
                  {productReviews.length > 0 ? (
                    <div className="space-y-6">
                      {productReviews.map((review) => (
                        <div key={review.id} className="border-b pb-6">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
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
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={14}
                                      className={
                                        i < review.rating
                                          ? 'text-yellow-400 fill-yellow-400'
                                          : 'text-gray-300'
                                      }
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">{review.createdAt}</span>
                              </div>
                              <h4 className="font-medium text-gray-800 mb-1">{review.title}</h4>
                              <p className="text-gray-600">{review.comment}</p>
                              <div className="mt-3 flex items-center gap-4">
                                <button className="text-sm text-gray-500 hover:text-primary-600">
                                  Helpful ({review.helpfulCount})
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No reviews yet. Be the first to review!</p>
                      <button className="btn-primary">Write a Review</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="section-title mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
