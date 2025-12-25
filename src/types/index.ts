// Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: Category;
  subcategory: string;
  price: number;
  originalPrice: number;
  discount: number;
  unit: string;
  minQuantity: number;
  maxQuantity: number;
  stockStatus: 'in-stock' | 'limited' | 'out-of-stock';
  stockCount: number;
  images: string[];
  rating: number;
  reviewCount: number;
  isOrganic: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  brand: string;
  origin: string;
  nutritionalInfo?: NutritionalInfo;
  storageInstructions?: string;
  shelfLife?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  vitamins?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  productCount: number;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
  selectedUnit: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  tax: number;
  total: number;
  couponCode?: string;
  couponDiscount?: number;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  addresses: Address[];
  defaultAddressId?: string;
  wallet: Wallet;
  loyaltyPoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  createdAt: string;
}

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

export interface Wallet {
  balance: number;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: OrderStatus;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  tax: number;
  total: number;
  couponCode?: string;
  deliverySlot: DeliverySlot;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface DeliverySlot {
  date: string;
  timeSlot: string;
  isExpress: boolean;
}

export type PaymentMethod = 
  | 'card'
  | 'upi'
  | 'netbanking'
  | 'cod'
  | 'wallet';

// Review Types
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}

// Coupon Types
export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

// Banner Types
export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link: string;
  buttonText?: string;
  position: number;
  isActive: boolean;
}

// Offer Types
export interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
  discountPercentage: number;
  validUntil: string;
  products?: string[];
  categories?: string[];
}

// Search Types
export interface SearchSuggestion {
  type: 'product' | 'category' | 'search';
  text: string;
  image?: string;
  link: string;
}

// Filter Types
export interface ProductFilters {
  categories: string[];
  subcategories: string[];
  priceRange: [number, number];
  brands: string[];
  isOrganic?: boolean;
  rating?: number;
  stockStatus?: string[];
  sortBy: SortOption;
}

export type SortOption = 
  | 'relevance'
  | 'price-low-high'
  | 'price-high-low'
  | 'popularity'
  | 'newest'
  | 'discount'
  | 'rating';

// Notification Types
export interface Notification {
  id: string;
  type: 'order' | 'promotion' | 'price-drop' | 'back-in-stock' | 'system';
  title: string;
  message: string;
  image?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

// Subscription Types
export interface Subscription {
  id: string;
  userId: string;
  product: Product;
  quantity: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  nextDelivery: string;
  status: 'active' | 'paused' | 'cancelled';
  discount: number;
  createdAt: string;
}
