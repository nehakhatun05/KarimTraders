'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Loader2,
  LogOut,
  Home,
  Save,
  Upload,
  Check,
  AlertTriangle,
  MapPin,
  FolderTree,
  Ticket,
  Calendar,
  Percent,
  Copy,
  Mail,
  Phone,
  Ban,
  CheckCircle,
  PieChart
} from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUpload from '@/components/admin/ImageUpload';
import InventoryAlerts from '@/components/admin/InventoryAlerts';
import ServiceAreasManager from '@/components/admin/ServiceAreasManager';

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'products', icon: Package, label: 'Products' },
  { id: 'categories', icon: FolderTree, label: 'Categories' },
  { id: 'orders', icon: ShoppingCart, label: 'Orders' },
  { id: 'customers', icon: Users, label: 'Customers' },
  { id: 'coupons', icon: Ticket, label: 'Coupons' },
  { id: 'service-areas', icon: MapPin, label: 'Service Areas' },
  { id: 'inventory', icon: AlertTriangle, label: 'Inventory Alerts' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
}

interface Order {
  id: string;
  orderNumber: string;
  user: { name: string; email: string };
  createdAt: string;
  total: number;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  _count: { orders: number };
}

interface ProductForm {
  id?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice: number;
  discount: number;
  unit: string;
  sku: string;
  stockCount: number;
  stockStatus: string;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isOrganic: boolean;
  isNew: boolean;
  tags: string[];
  images: { url: string; alt: string }[];
}

const defaultProductForm: ProductForm = {
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  price: 0,
  originalPrice: 0,
  discount: 0,
  unit: '1 kg',
  sku: '',
  stockCount: 0,
  stockStatus: 'IN_STOCK',
  categoryId: '',
  isActive: true,
  isFeatured: false,
  isBestSeller: false,
  isOrganic: false,
  isNew: false,
  tags: [],
  images: [{ url: '', alt: '' }],
};

interface CategoryForm {
  id?: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  parentId: string;
  sortOrder: number;
  isActive: boolean;
}

const defaultCategoryForm: CategoryForm = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  image: '',
  parentId: '',
  sortOrder: 0,
  isActive: true,
};

interface CouponForm {
  id?: string;
  code: string;
  description: string;
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_DELIVERY';
  value: number;
  minOrderAmount: number;
  maxDiscount: number;
  usageLimit: number;
  perUserLimit: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

const defaultCouponForm: CouponForm = {
  code: '',
  description: '',
  type: 'PERCENTAGE',
  value: 10,
  minOrderAmount: 0,
  maxDiscount: 0,
  usageLimit: 0,
  perUserLimit: 1,
  validFrom: new Date().toISOString().split('T')[0],
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  isActive: true,
};

interface AnalyticsData {
  period: string;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    newCustomers: number;
    revenueGrowth: number;
    ordersGrowth: number;
    customerGrowth: number;
  };
  dailyRevenue: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
  ordersByPayment: { method: string; count: number }[];
  topProducts: { id: string; name: string; quantity: number; revenue: number }[];
  categoryPerformance: { id: string; name: string; quantity: number; revenue: number }[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Dashboard data
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Product management state
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [productForm, setProductForm] = useState<ProductForm>(defaultProductForm);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Order management state
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showOrderViewModal, setShowOrderViewModal] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);

  // Category management state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(defaultCategoryForm);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // Coupon management state
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showDeleteCouponModal, setShowDeleteCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState<CouponForm>(defaultCouponForm);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [isEditingCoupon, setIsEditingCoupon] = useState(false);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [deletingCoupon, setDeletingCoupon] = useState(false);
  const [couponSearchQuery, setCouponSearchQuery] = useState('');
  const [couponStatusFilter, setCouponStatusFilter] = useState('');

  // Customer management state
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [loadingCustomerDetails, setLoadingCustomerDetails] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30d');
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
        router.push('/account');
        return;
      }
      fetchDashboardData();
    }
  }, [status, session, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, ordersRes, usersRes, productsRes, categoriesRes, allOrdersRes, couponsRes] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch('/api/admin/orders?limit=5'),
        fetch('/api/admin/users?limit=100'),
        fetch('/api/products?limit=100'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/orders?limit=100'),
        fetch('/api/admin/coupons'),
      ]);

      if (dashboardRes.ok) {
        const data = await dashboardRes.json();
        setStats(data);
      }

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setRecentOrders(data.orders || []);
      }

      if (allOrdersRes.ok) {
        const data = await allOrdersRes.json();
        setAllOrders(data.orders || []);
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        setCustomers(data.users || []);
      }

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.products || []);
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories || data || []);
      }

      if (couponsRes.ok) {
        const data = await couponsRes.json();
        setCoupons(data.coupons || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
      case 'PROCESSING': return 'bg-blue-100 text-blue-700';
      case 'SHIPPED': return 'bg-purple-100 text-purple-700';
      case 'OUT_FOR_DELIVERY': return 'bg-orange-100 text-orange-700';
      case 'DELIVERED': return 'bg-green-100 text-green-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Product Management Functions
  const openAddProductModal = () => {
    setProductForm(defaultProductForm);
    setIsEditing(false);
    setShowProductModal(true);
  };

  const openEditProductModal = (product: any) => {
    setProductForm({
      id: product.id,
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      price: product.price || 0,
      originalPrice: product.originalPrice || 0,
      discount: product.discount || 0,
      unit: product.unit || '1 kg',
      sku: product.sku || '',
      stockCount: product.stockCount || 0,
      stockStatus: product.stockStatus || 'IN_STOCK',
      categoryId: product.categoryId || product.category?.id || '',
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured || false,
      isBestSeller: product.isBestSeller || false,
      isOrganic: product.isOrganic || false,
      isNew: product.isNew || false,
      tags: product.tags || [],
      images: product.images?.length > 0 
        ? product.images.map((img: any) => ({ url: img.url, alt: img.alt || '' }))
        : [{ url: '', alt: '' }],
    });
    setIsEditing(true);
    setShowProductModal(true);
  };

  const openViewProductModal = (product: any) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const openDeleteConfirmation = (product: any) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleProductFormChange = (field: string, value: any) => {
    setProductForm(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-generate slug when name changes
      if (field === 'name' && !isEditing) {
        updated.slug = generateSlug(value);
      }
      // Auto-calculate discount when prices change
      if (field === 'price' || field === 'originalPrice') {
        const price = field === 'price' ? value : prev.price;
        const originalPrice = field === 'originalPrice' ? value : prev.originalPrice;
        if (originalPrice > 0 && price > 0 && originalPrice > price) {
          updated.discount = Math.round(((originalPrice - price) / originalPrice) * 100);
        }
      }
      return updated;
    });
  };

  const handleImageChange = (index: number, field: string, value: string) => {
    setProductForm(prev => {
      const images = [...prev.images];
      images[index] = { ...images[index], [field]: value };
      return { ...prev, images };
    });
  };

  const addImageField = () => {
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, { url: '', alt: '' }],
    }));
  };

  const removeImageField = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.categoryId) {
      toast.error('Please fill in required fields (Name, Price, Category)');
      return;
    }

    setSaving(true);
    try {
      const url = isEditing 
        ? `/api/products/${productForm.slug}`
        : '/api/products';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price.toString()),
          originalPrice: parseFloat(productForm.originalPrice.toString()) || parseFloat(productForm.price.toString()),
          discount: parseInt(productForm.discount.toString()) || 0,
          stockCount: parseInt(productForm.stockCount.toString()) || 0,
          images: productForm.images.filter(img => img.url),
        }),
      });

      if (response.ok) {
        toast.success(isEditing ? 'Product updated successfully!' : 'Product created successfully!');
        setShowProductModal(false);
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Save product error:', error);
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/products/${selectedProduct.slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Product deleted successfully!');
        setShowDeleteModal(false);
        setSelectedProduct(null);
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Delete product error:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const toggleProductStatus = async (product: any) => {
    try {
      const response = await fetch(`/api/products/${product.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          isActive: !product.isActive,
        }),
      });

      if (response.ok) {
        toast.success(`Product ${!product.isActive ? 'activated' : 'deactivated'}`);
        fetchDashboardData();
      }
    } catch (error) {
      toast.error('Failed to update product status');
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || product.categoryId === filterCategory || product.category?.id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter orders
  const filteredOrders = allOrders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(orderSearchQuery.toLowerCase());
    const matchesStatus = !orderStatusFilter || order.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Order management functions
  const viewOrderDetails = async (order: any) => {
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data);
        setShowOrderViewModal(true);
      } else {
        toast.error('Failed to load order details');
      }
    } catch (error) {
      toast.error('Failed to load order details');
    }
  };

  const openOrderStatusModal = (order: any) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    
    setUpdatingOrderStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`);
        setShowOrderModal(false);
        setSelectedOrder(null);
        fetchDashboardData();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to update order status');
      }
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setUpdatingOrderStatus(false);
    }
  };

  const orderStatuses = [
    { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
    { value: 'PROCESSING', label: 'Processing', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'PACKED', label: 'Packed', color: 'bg-purple-100 text-purple-700' },
    { value: 'SHIPPED', label: 'Shipped', color: 'bg-cyan-100 text-cyan-700' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: 'bg-orange-100 text-orange-700' },
    { value: 'DELIVERED', label: 'Delivered', color: 'bg-green-100 text-green-700' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  ];

  // ==================== CATEGORY MANAGEMENT ====================
  const openAddCategoryModal = () => {
    setCategoryForm(defaultCategoryForm);
    setIsEditingCategory(false);
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (category: any) => {
    setCategoryForm({
      id: category.id,
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      icon: category.icon || '',
      image: category.image || '',
      parentId: category.parentId || '',
      sortOrder: category.sortOrder || 0,
      isActive: category.isActive ?? true,
    });
    setIsEditingCategory(true);
    setShowCategoryModal(true);
  };

  const openDeleteCategoryConfirmation = (category: any) => {
    setSelectedCategory(category);
    setShowDeleteCategoryModal(true);
  };

  const generateCategorySlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleCategoryFormChange = (field: string, value: any) => {
    setCategoryForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'name' && !isEditingCategory) {
        updated.slug = generateCategorySlug(value);
      }
      return updated;
    });
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name) {
      toast.error('Category name is required');
      return;
    }

    setSavingCategory(true);
    try {
      const url = isEditingCategory 
        ? `/api/admin/categories/${categoryForm.id}`
        : '/api/admin/categories';
      
      const response = await fetch(url, {
        method: isEditingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      });

      if (response.ok) {
        toast.success(isEditingCategory ? 'Category updated!' : 'Category created!');
        setShowCategoryModal(false);
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save category');
      }
    } catch (error) {
      toast.error('Failed to save category');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    setDeletingCategory(true);
    try {
      const response = await fetch(`/api/admin/categories/${selectedCategory.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Category deleted!');
        setShowDeleteCategoryModal(false);
        setSelectedCategory(null);
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete category');
      }
    } catch (error) {
      toast.error('Failed to delete category');
    } finally {
      setDeletingCategory(false);
    }
  };

  const toggleCategoryStatus = async (category: any) => {
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !category.isActive }),
      });

      if (response.ok) {
        toast.success(`Category ${!category.isActive ? 'activated' : 'deactivated'}`);
        fetchDashboardData();
      }
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  const filteredCategories = categories.filter((cat: any) =>
    cat.name?.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  // ==================== COUPON MANAGEMENT ====================
  const openAddCouponModal = () => {
    setCouponForm(defaultCouponForm);
    setIsEditingCoupon(false);
    setShowCouponModal(true);
  };

  const openEditCouponModal = (coupon: any) => {
    setCouponForm({
      id: coupon.id,
      code: coupon.code || '',
      description: coupon.description || '',
      type: coupon.type || 'PERCENTAGE',
      value: coupon.value || 0,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscount: coupon.maxDiscount || 0,
      usageLimit: coupon.usageLimit || 0,
      perUserLimit: coupon.perUserLimit || 1,
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '',
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
      isActive: coupon.isActive ?? true,
    });
    setIsEditingCoupon(true);
    setShowCouponModal(true);
  };

  const openDeleteCouponConfirmation = (coupon: any) => {
    setSelectedCoupon(coupon);
    setShowDeleteCouponModal(true);
  };

  const handleCouponFormChange = (field: string, value: any) => {
    setCouponForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveCoupon = async () => {
    if (!couponForm.code || !couponForm.validFrom || !couponForm.validUntil) {
      toast.error('Code and validity dates are required');
      return;
    }

    setSavingCoupon(true);
    try {
      const url = isEditingCoupon 
        ? `/api/admin/coupons/${couponForm.id}`
        : '/api/admin/coupons';
      
      const response = await fetch(url, {
        method: isEditingCoupon ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponForm),
      });

      if (response.ok) {
        toast.success(isEditingCoupon ? 'Coupon updated!' : 'Coupon created!');
        setShowCouponModal(false);
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save coupon');
      }
    } catch (error) {
      toast.error('Failed to save coupon');
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleDeleteCoupon = async () => {
    if (!selectedCoupon) return;

    setDeletingCoupon(true);
    try {
      const response = await fetch(`/api/admin/coupons/${selectedCoupon.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Coupon deleted!');
        setShowDeleteCouponModal(false);
        setSelectedCoupon(null);
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete coupon');
      }
    } catch (error) {
      toast.error('Failed to delete coupon');
    } finally {
      setDeletingCoupon(false);
    }
  };

  const toggleCouponStatus = async (coupon: any) => {
    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });

      if (response.ok) {
        toast.success(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'}`);
        fetchDashboardData();
      }
    } catch (error) {
      toast.error('Failed to update coupon');
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied!');
  };

  const getCouponStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredCoupons = coupons.filter((coupon: any) => {
    const matchesSearch = coupon.code?.toLowerCase().includes(couponSearchQuery.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(couponSearchQuery.toLowerCase());
    const matchesStatus = !couponStatusFilter || coupon.status === couponStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // ==================== CUSTOMER MANAGEMENT ====================
  const viewCustomerDetails = async (customer: any) => {
    setSelectedCustomer(customer);
    setLoadingCustomerDetails(true);
    setShowCustomerModal(true);
    
    try {
      const res = await fetch(`/api/admin/orders?userId=${customer.id}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setCustomerOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching customer orders:', error);
    } finally {
      setLoadingCustomerDetails(false);
    }
  };

  const filteredCustomers = customers.filter((customer: any) => {
    const searchLower = customerSearchQuery.toLowerCase();
    return customer.name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.includes(customerSearchQuery);
  });

  // ==================== ANALYTICS ====================
  const fetchAnalytics = async (period: string) => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'analytics') {
      fetchAnalytics(analyticsPeriod);
    }
  }, [activeSection, analyticsPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />;
  };

  const dashboardStats = [
    { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, change: '+12%', trend: 'up', icon: DollarSign },
    { label: 'Total Orders', value: (stats.totalOrders || 0).toString(), change: '+8%', trend: 'up', icon: ShoppingBag },
    { label: 'Total Customers', value: (stats.totalCustomers || 0).toString(), change: '+15%', trend: 'up', icon: Users },
    { label: 'Products', value: (stats.totalProducts || 0).toString(), change: '+5', trend: 'up', icon: Package },
  ];

  // Show loading state while checking auth
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // Redirect non-admin users (handled in useEffect, this is just a render guard)
  if (status === 'unauthenticated' || (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN')) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={22} className="sm:w-6 sm:h-6" />
            </button>
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">K</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display font-bold text-lg text-gray-800">KARIM TRADERS</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-4">
            <Link href="/" className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg" title="Go to Store">
              <Home size={20} className="sm:w-[22px] sm:h-[22px]" />
            </Link>
            <button className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg">
              <Bell size={20} className="sm:w-[22px] sm:h-[22px]" />
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="font-medium text-primary-600 text-sm sm:text-base">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{session?.user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 sm:p-2 hover:bg-red-50 rounded-lg text-red-600"
              title="Logout"
            >
              <LogOut size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-200`}
        >
          <div className="p-4 lg:hidden flex justify-end">
            <button onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <nav className="p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                    activeSection === item.id
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-8 overflow-x-hidden">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Dashboard Overview</h2>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {dashboardStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Icon className="text-primary-600" size={20} />
                        </div>
                        <span className={`flex items-center gap-1 text-xs sm:text-sm ${
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-lg sm:text-2xl font-bold text-gray-800">{stat.value}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold">Recent Orders</h3>
                  <button 
                    onClick={() => setActiveSection('orders')}
                    className="text-primary-600 text-xs sm:text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                {recentOrders.length > 0 ? (
                  <>
                    {/* Mobile View - Cards */}
                    <div className="block sm:hidden space-y-3">
                      {recentOrders.slice(0, 5).map((order) => (
                        <div key={order.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-sm">#{order.orderNumber || order.id.slice(-8).toUpperCase()}</p>
                              <p className="text-xs text-gray-500">{order.user?.name || 'N/A'}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                            <span className="font-semibold">₹{order.total}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Desktop View - Table */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead>
                          <tr className="text-left border-b">
                            <th className="pb-3 font-medium text-gray-500 text-sm">Order ID</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Customer</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Date</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Total</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Status</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map((order) => (
                            <tr key={order.id} className="border-b last:border-0">
                              <td className="py-3 font-medium text-sm">{order.orderNumber || order.id.slice(-8).toUpperCase()}</td>
                              <td className="py-3 text-sm">{order.user?.name || 'N/A'}</td>
                              <td className="py-3 text-gray-500 text-sm">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 font-medium text-sm">₹{order.total}</td>
                              <td className="py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                  {order.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-3">
                                <div className="flex items-center gap-1">
                                  <button className="p-1 hover:bg-gray-100 rounded">
                                    <Eye size={16} className="text-gray-500" />
                                  </button>
                                  <button className="p-1 hover:bg-gray-100 rounded">
                                    <Edit size={16} className="text-gray-500" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No orders yet
                  </div>
                )}
              </div>

              {/* Category Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Products by Category</h3>
                  {categories.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {categories.slice(0, 6).map((category: any) => (
                        <div key={category.id} className="flex items-center gap-3 sm:gap-4">
                          <span className="text-xl sm:text-2xl">{category.icon || '📦'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium text-sm sm:text-base truncate">{category.name}</span>
                              <span className="text-gray-500 text-sm ml-2">{category._count?.products || 0}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                              <div
                                className="bg-primary-600 h-1.5 sm:h-2 rounded-full"
                                style={{ width: `${Math.min(((category._count?.products || 0) / 50) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4 text-sm">No categories yet</p>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Recent Customers</h3>
                  {customers.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {customers.slice(0, 5).map((customer: any) => (
                        <div key={customer.id} className="flex items-center gap-3 sm:gap-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="font-medium text-primary-600 text-sm sm:text-base">
                              {customer.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{customer.name}</p>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">{customer.email}</p>
                          </div>
                          <span className="text-gray-500 text-xs sm:text-sm whitespace-nowrap">{customer._count?.orders || 0} orders</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4 text-sm">No customers yet</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Orders Section */}
          {activeSection === 'orders' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Orders ({filteredOrders.length})</h2>
              </div>

              {/* Search and Filter */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search by order ID, customer name or email..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                  </div>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="">All Statuses</option>
                    {orderStatuses.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                {filteredOrders.length > 0 ? (
                  <>
                    {/* Mobile View - Cards */}
                    <div className="block sm:hidden space-y-3">
                      {filteredOrders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-sm">#{order.orderNumber || order.id.slice(-8).toUpperCase()}</p>
                              <p className="text-xs text-gray-500">{order.user?.name || 'N/A'}</p>
                              <p className="text-xs text-gray-400">{order.user?.phone || ''}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                            <span className="font-semibold">₹{order.total}</span>
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            {order.items?.length || 0} items • {order.paymentMethod || 'N/A'}
                          </div>
                          <div className="flex gap-2 pt-2 border-t">
                            <button 
                              onClick={() => viewOrderDetails(order)}
                              className="flex-1 py-1.5 text-xs text-center bg-gray-50 rounded hover:bg-gray-100"
                            >
                              View Details
                            </button>
                            <button 
                              onClick={() => openOrderStatusModal(order)}
                              className="flex-1 py-1.5 text-xs text-center bg-primary-50 text-primary-600 rounded hover:bg-primary-100"
                            >
                              Update Status
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Desktop View - Table */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full min-w-[800px]">
                        <thead>
                          <tr className="text-left border-b">
                            <th className="pb-3 font-medium text-gray-500 text-sm">Order ID</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Customer</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Items</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Date</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Total</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Payment</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Status</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((order) => (
                            <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                              <td className="py-3 font-medium text-sm">
                                #{order.orderNumber || order.id.slice(-8).toUpperCase()}
                              </td>
                              <td className="py-3">
                                <div>
                                  <p className="text-sm font-medium">{order.user?.name || 'N/A'}</p>
                                  <p className="text-xs text-gray-500">{order.user?.phone || order.user?.email}</p>
                                </div>
                              </td>
                              <td className="py-3 text-sm">{order.items?.length || 0} items</td>
                              <td className="py-3 text-gray-500 text-sm">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 font-medium text-sm">₹{order.total}</td>
                              <td className="py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {order.paymentMethod || 'N/A'}
                                </span>
                              </td>
                              <td className="py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                  {order.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-3">
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => viewOrderDetails(order)}
                                    className="p-1.5 hover:bg-gray-100 rounded"
                                    title="View Details"
                                  >
                                    <Eye size={16} className="text-gray-500" />
                                  </button>
                                  <button 
                                    onClick={() => openOrderStatusModal(order)}
                                    className="p-1.5 hover:bg-gray-100 rounded"
                                    title="Update Status"
                                  >
                                    <Edit size={16} className="text-primary-500" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    {orderSearchQuery || orderStatusFilter ? 'No orders match your filters' : 'No orders yet'}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Customers Section */}
          {activeSection === 'customers' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Customers ({filteredCustomers.length})</h2>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                {filteredCustomers.length > 0 ? (
                  <>
                    {/* Mobile View - Cards */}
                    <div className="block sm:hidden space-y-3">
                      {filteredCustomers.map((customer: any) => (
                        <div key={customer.id} className="border rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="font-medium text-primary-600">
                                {customer.name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{customer.name || 'No name'}</p>
                              <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                              {customer.phone && (
                                <p className="text-xs text-gray-400">{customer.phone}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-3 pt-3 border-t">
                            <div className="text-xs text-gray-500">
                              <span className="font-medium text-gray-700">{customer._count?.orders || 0}</span> orders
                              {customer.wallet?.balance > 0 && (
                                <span className="ml-2">• Wallet: ₹{customer.wallet.balance}</span>
                              )}
                            </div>
                            <button 
                              onClick={() => viewCustomerDetails(customer)}
                              className="px-3 py-1 text-xs bg-primary-50 text-primary-600 rounded hover:bg-primary-100"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Desktop View - Table */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead>
                          <tr className="text-left border-b">
                            <th className="pb-3 font-medium text-gray-500 text-sm">Customer</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Contact</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Joined</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Orders</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Wallet</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCustomers.map((customer: any) => (
                            <tr key={customer.id} className="border-b last:border-0 hover:bg-gray-50">
                              <td className="py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                    <span className="font-medium text-primary-600 text-sm">
                                      {customer.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-sm">{customer.name || 'No name'}</span>
                                    <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                      customer.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                      customer.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700' :
                                      'bg-gray-100 text-gray-600'
                                    }`}>
                                      {customer.role}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3">
                                <div className="text-sm">
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Mail size={12} /> {customer.email}
                                  </div>
                                  {customer.phone && (
                                    <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                                      <Phone size={10} /> {customer.phone}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 text-gray-500 text-sm">
                                {new Date(customer.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3">
                                <span className="font-medium">{customer._count?.orders || 0}</span>
                              </td>
                              <td className="py-3">
                                <span className={`font-medium ${customer.wallet?.balance > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                  ₹{customer.wallet?.balance || 0}
                                </span>
                              </td>
                              <td className="py-3">
                                <button 
                                  onClick={() => viewCustomerDetails(customer)}
                                  className="p-1.5 hover:bg-primary-50 rounded text-primary-600"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    {customerSearchQuery ? 'No customers match your search' : 'No customers yet'}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Products Section */}
          {activeSection === 'products' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Products ({filteredProducts.length})</h2>
                <button 
                  onClick={openAddProductModal}
                  className="btn-primary flex items-center justify-center gap-1 sm:gap-2 text-sm px-3 py-2 sm:px-4"
                >
                  <Plus size={16} />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Search and Filter */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search products by name or SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                {filteredProducts.length > 0 ? (
                  <>
                    {/* Mobile View - Cards */}
                    <div className="block sm:hidden space-y-3">
                      {filteredProducts.map((product: any) => (
                        <div key={product.id} className={`border rounded-lg p-3 ${!product.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
                          <div className="flex items-start gap-3">
                            <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {product.images?.[0]?.url ? (
                                <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Package size={20} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-sm truncate">{product.name}</p>
                                {!product.isActive && (
                                  <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Inactive</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">{product.category?.name || 'N/A'}</p>
                              <div className="flex justify-between items-center mt-1">
                                <span className="font-semibold text-sm">₹{product.price}</span>
                                <span className={`text-xs ${product.stockCount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  Stock: {product.stockCount}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {product.isFeatured && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">Featured</span>}
                                {product.isBestSeller && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">Bestseller</span>}
                                {product.isOrganic && <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded">Organic</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3 pt-2 border-t">
                            <button 
                              onClick={() => openViewProductModal(product)}
                              className="flex-1 py-1.5 text-xs text-center bg-gray-50 rounded hover:bg-gray-100 flex items-center justify-center gap-1"
                            >
                              <Eye size={12} /> View
                            </button>
                            <button 
                              onClick={() => openEditProductModal(product)}
                              className="flex-1 py-1.5 text-xs text-center bg-primary-50 text-primary-600 rounded hover:bg-primary-100 flex items-center justify-center gap-1"
                            >
                              <Edit size={12} /> Edit
                            </button>
                            <button 
                              onClick={() => openDeleteConfirmation(product)}
                              className="flex-1 py-1.5 text-xs text-center bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center justify-center gap-1"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Desktop View - Table */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full min-w-[700px]">
                        <thead>
                          <tr className="text-left border-b">
                            <th className="pb-3 font-medium text-gray-500 text-sm">Product</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Category</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Price</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Stock</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Status</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Tags</th>
                            <th className="pb-3 font-medium text-gray-500 text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map((product: any) => (
                            <tr key={product.id} className={`border-b last:border-0 ${!product.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
                              <td className="py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    {product.images?.[0]?.url ? (
                                      <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Package size={18} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm">{product.name}</p>
                                    <p className="text-xs text-gray-500">SKU: {product.sku || 'N/A'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 text-sm">{product.category?.name || 'N/A'}</td>
                              <td className="py-3">
                                <div>
                                  <p className="font-medium text-sm">₹{product.price}</p>
                                  {product.discount > 0 && (
                                    <p className="text-xs text-gray-400 line-through">₹{product.originalPrice}</p>
                                  )}
                                </div>
                              </td>
                              <td className="py-3">
                                <span className={`text-sm font-medium ${product.stockCount > 10 ? 'text-green-600' : product.stockCount > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                                  {product.stockCount}
                                </span>
                              </td>
                              <td className="py-3">
                                <button
                                  onClick={() => toggleProductStatus(product)}
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                >
                                  {product.isActive ? 'Active' : 'Inactive'}
                                </button>
                              </td>
                              <td className="py-3">
                                <div className="flex flex-wrap gap-1">
                                  {product.isFeatured && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">Featured</span>}
                                  {product.isBestSeller && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">Bestseller</span>}
                                  {product.isOrganic && <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded">Organic</span>}
                                  {product.isNew && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">New</span>}
                                </div>
                              </td>
                              <td className="py-3">
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => openViewProductModal(product)}
                                    className="p-1.5 hover:bg-gray-100 rounded" title="View"
                                  >
                                    <Eye size={16} className="text-gray-500" />
                                  </button>
                                  <button 
                                    onClick={() => openEditProductModal(product)}
                                    className="p-1.5 hover:bg-blue-50 rounded" title="Edit"
                                  >
                                    <Edit size={16} className="text-blue-500" />
                                  </button>
                                  <button 
                                    onClick={() => openDeleteConfirmation(product)}
                                    className="p-1.5 hover:bg-red-50 rounded" title="Delete"
                                  >
                                    <Trash2 size={16} className="text-red-500" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Package size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No products found</p>
                    <button 
                      onClick={openAddProductModal}
                      className="mt-4 text-primary-600 text-sm font-medium hover:underline"
                    >
                      Add your first product
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Other Sections - Placeholder */}
          {activeSection === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 capitalize">{activeSection}</h2>
              <p className="text-gray-500">This section is under development.</p>
            </div>
          )}

          {/* Categories Section */}
          {activeSection === 'categories' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Categories ({filteredCategories.length})</h2>
                <button 
                  onClick={openAddCategoryModal}
                  className="btn-primary flex items-center justify-center gap-1 sm:gap-2 text-sm px-3 py-2 sm:px-4"
                >
                  <Plus size={16} />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                {filteredCategories.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCategories.map((category: any) => (
                      <div key={category.id} className={`border rounded-lg p-4 ${!category.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl">
                            {category.icon || '📦'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{category.name}</h3>
                            <p className="text-sm text-gray-500 truncate">{category.slug}</p>
                            <p className="text-xs text-gray-400 mt-1">{category._count?.products || 0} products</p>
                          </div>
                          <button
                            onClick={() => toggleCategoryStatus(category)}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                          >
                            {category.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </div>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{category.description}</p>
                        )}
                        {category.parent && (
                          <p className="text-xs text-gray-400 mt-2">Parent: {category.parent.name}</p>
                        )}
                        <div className="flex gap-2 mt-3 pt-3 border-t">
                          <button 
                            onClick={() => openEditCategoryModal(category)}
                            className="flex-1 py-1.5 text-xs text-center bg-primary-50 text-primary-600 rounded hover:bg-primary-100 flex items-center justify-center gap-1"
                          >
                            <Edit size={12} /> Edit
                          </button>
                          <button 
                            onClick={() => openDeleteCategoryConfirmation(category)}
                            className="flex-1 py-1.5 text-xs text-center bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center justify-center gap-1"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FolderTree size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No categories found</p>
                    <button 
                      onClick={openAddCategoryModal}
                      className="mt-4 text-primary-600 text-sm font-medium hover:underline"
                    >
                      Add your first category
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Coupons Section */}
          {activeSection === 'coupons' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Coupons ({filteredCoupons.length})</h2>
                <button 
                  onClick={openAddCouponModal}
                  className="btn-primary flex items-center justify-center gap-1 sm:gap-2 text-sm px-3 py-2 sm:px-4"
                >
                  <Plus size={16} />
                  <span>Add Coupon</span>
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search coupons..."
                      value={couponSearchQuery}
                      onChange={(e) => setCouponSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                  <select
                    value={couponStatusFilter}
                    onChange={(e) => setCouponStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                {filteredCoupons.length > 0 ? (
                  <div className="space-y-4">
                    {filteredCoupons.map((coupon: any) => (
                      <div key={coupon.id} className={`border rounded-lg p-4 ${!coupon.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Ticket className="text-white" size={24} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-mono font-bold text-lg">{coupon.code}</h3>
                                <button 
                                  onClick={() => copyCouponCode(coupon.code)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                  title="Copy code"
                                >
                                  <Copy size={14} className="text-gray-400" />
                                </button>
                              </div>
                              <p className="text-sm text-gray-500">{coupon.description || 'No description'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCouponStatusColor(coupon.status)}`}>
                              {coupon.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                          <div>
                            <p className="text-xs text-gray-500">Discount</p>
                            <p className="font-semibold">
                              {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : 
                               coupon.type === 'FREE_DELIVERY' ? 'Free Delivery' : `₹${coupon.value}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Min Order</p>
                            <p className="font-semibold">{coupon.minOrderAmount ? `₹${coupon.minOrderAmount}` : 'None'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Usage</p>
                            <p className="font-semibold">
                              {coupon.usedCount}/{coupon.usageLimit || '∞'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Valid Until</p>
                            <p className="font-semibold">{new Date(coupon.validUntil).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4 pt-3 border-t">
                          <button 
                            onClick={() => openEditCouponModal(coupon)}
                            className="flex-1 py-2 text-sm text-center bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 flex items-center justify-center gap-1"
                          >
                            <Edit size={14} /> Edit
                          </button>
                          <button 
                            onClick={() => toggleCouponStatus(coupon)}
                            className={`flex-1 py-2 text-sm text-center rounded-lg flex items-center justify-center gap-1 ${
                              coupon.isActive ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}
                          >
                            {coupon.isActive ? <><Ban size={14} /> Disable</> : <><CheckCircle size={14} /> Enable</>}
                          </button>
                          <button 
                            onClick={() => openDeleteCouponConfirmation(coupon)}
                            className="flex-1 py-2 text-sm text-center bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center gap-1"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Ticket size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No coupons found</p>
                    <button 
                      onClick={openAddCouponModal}
                      className="mt-4 text-primary-600 text-sm font-medium hover:underline"
                    >
                      Create your first coupon
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Analytics Section */}
          {activeSection === 'analytics' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Analytics</h2>
                <select
                  value={analyticsPeriod}
                  onChange={(e) => setAnalyticsPeriod(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm bg-white"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="365d">Last Year</option>
                </select>
              </div>

              {loadingAnalytics ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="animate-spin text-primary-600" size={32} />
                </div>
              ) : analytics ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Total Revenue</span>
                        <span className={`flex items-center gap-1 text-xs ${getGrowthColor(analytics.summary.revenueGrowth)}`}>
                          {getGrowthIcon(analytics.summary.revenueGrowth)}
                          {analytics.summary.revenueGrowth.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-2xl font-bold">{formatCurrency(analytics.summary.totalRevenue)}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Total Orders</span>
                        <span className={`flex items-center gap-1 text-xs ${getGrowthColor(analytics.summary.ordersGrowth)}`}>
                          {getGrowthIcon(analytics.summary.ordersGrowth)}
                          {analytics.summary.ordersGrowth.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-2xl font-bold">{analytics.summary.totalOrders}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Avg Order Value</span>
                      </div>
                      <p className="text-2xl font-bold">{formatCurrency(analytics.summary.avgOrderValue)}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">New Customers</span>
                        <span className={`flex items-center gap-1 text-xs ${getGrowthColor(analytics.summary.customerGrowth)}`}>
                          {getGrowthIcon(analytics.summary.customerGrowth)}
                          {analytics.summary.customerGrowth.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-2xl font-bold">{analytics.summary.newCustomers}</p>
                    </div>
                  </div>

                  {/* Revenue Chart */}
                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
                    <div className="h-64 flex items-end gap-1">
                      {analytics.dailyRevenue.slice(-30).map((day, index) => {
                        const maxRevenue = Math.max(...analytics.dailyRevenue.map(d => d.revenue));
                        const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center group relative">
                            <div 
                              className="w-full bg-primary-500 rounded-t hover:bg-primary-600 transition-colors cursor-pointer"
                              style={{ height: `${Math.max(height, 2)}%` }}
                            />
                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                              {new Date(day.date).toLocaleDateString()}<br />
                              Revenue: {formatCurrency(day.revenue)}<br />
                              Orders: {day.orders}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>{analytics.dailyRevenue[0]?.date && new Date(analytics.dailyRevenue[0].date).toLocaleDateString()}</span>
                      <span>{analytics.dailyRevenue[analytics.dailyRevenue.length - 1]?.date && new Date(analytics.dailyRevenue[analytics.dailyRevenue.length - 1].date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Orders by Status */}
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                      <h3 className="text-lg font-semibold mb-4">Orders by Status</h3>
                      <div className="space-y-3">
                        {analytics.ordersByStatus.map((item) => {
                          const total = analytics.ordersByStatus.reduce((sum, s) => sum + s.count, 0);
                          const percentage = total > 0 ? (item.count / total) * 100 : 0;
                          return (
                            <div key={item.status}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                                  {item.status.replace('_', ' ')}
                                </span>
                                <span className="text-gray-600">{item.count}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary-500 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Orders by Payment */}
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                      <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
                      <div className="space-y-3">
                        {analytics.ordersByPayment.map((item) => {
                          const total = analytics.ordersByPayment.reduce((sum, s) => sum + s.count, 0);
                          const percentage = total > 0 ? (item.count / total) * 100 : 0;
                          return (
                            <div key={item.method}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium">{item.method}</span>
                                <span className="text-gray-600">{item.count} ({percentage.toFixed(1)}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Products */}
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                      <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
                      {analytics.topProducts.length > 0 ? (
                        <div className="space-y-3">
                          {analytics.topProducts.slice(0, 5).map((product, index) => (
                            <div key={product.id} className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                index === 1 ? 'bg-gray-100 text-gray-700' :
                                index === 2 ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-50 text-gray-500'
                              }`}>
                                {index + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.quantity} sold</p>
                              </div>
                              <span className="font-semibold text-sm text-primary-600">
                                {formatCurrency(product.revenue)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm text-center py-4">No sales data</p>
                      )}
                    </div>

                    {/* Category Performance */}
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                      <h3 className="text-lg font-semibold mb-4">Category Performance</h3>
                      {analytics.categoryPerformance.length > 0 ? (
                        <div className="space-y-3">
                          {analytics.categoryPerformance.slice(0, 5).map((category) => {
                            const maxRevenue = Math.max(...analytics.categoryPerformance.map(c => c.revenue));
                            const percentage = maxRevenue > 0 ? (category.revenue / maxRevenue) * 100 : 0;
                            return (
                              <div key={category.id}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="font-medium">{category.name}</span>
                                  <span className="text-gray-600">{formatCurrency(category.revenue)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-purple-500 h-2 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm text-center py-4">No category data</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No analytics data available</p>
                </div>
              )}
            </>
          )}

          {/* Inventory Alerts Section */}
          {activeSection === 'inventory' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Inventory Alerts</h2>
              </div>
              <InventoryAlerts />
            </>
          )}

          {/* Service Areas Section */}
          {activeSection === 'service-areas' && (
            <ServiceAreasManager />
          )}
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Add/Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Info */}
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-700 mb-3">Basic Information</h4>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => handleProductFormChange('name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="Enter product name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={productForm.slug}
                    onChange={(e) => handleProductFormChange('slug', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="product-slug"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => handleProductFormChange('categoryId', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => handleProductFormChange('sku', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="Auto-generated if empty"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={productForm.shortDescription}
                    onChange={(e) => handleProductFormChange('shortDescription', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="Brief product description"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => handleProductFormChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="Detailed product description"
                  />
                </div>

                {/* Pricing */}
                <div className="md:col-span-2 mt-4">
                  <h4 className="font-medium text-gray-700 mb-3">Pricing & Stock</h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => handleProductFormChange('price', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={(e) => handleProductFormChange('originalPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    value={productForm.discount}
                    onChange={(e) => handleProductFormChange('discount', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={productForm.unit}
                    onChange={(e) => handleProductFormChange('unit', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="e.g., 1 kg, 500g, 1 piece"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Count</label>
                  <input
                    type="number"
                    value={productForm.stockCount}
                    onChange={(e) => handleProductFormChange('stockCount', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                  <select
                    value={productForm.stockStatus}
                    onChange={(e) => handleProductFormChange('stockStatus', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="IN_STOCK">In Stock</option>
                    <option value="LOW_STOCK">Low Stock</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>

                {/* Images */}
                <div className="md:col-span-2 mt-4">
                  <h4 className="font-medium text-gray-700 mb-3">Product Images</h4>
                  
                  {/* Cloudinary Upload */}
                  <ImageUpload
                    value={productForm.images.map(img => img.url).filter(url => url)}
                    onChange={(urls) => {
                      const newImages = urls.map((url, i) => ({
                        url,
                        alt: productForm.images[i]?.alt || productForm.name || 'Product image',
                      }));
                      // Add empty slot if all are filled
                      if (newImages.length === 0) {
                        newImages.push({ url: '', alt: '' });
                      }
                      handleProductFormChange('images', newImages);
                    }}
                    maxImages={5}
                    folder="products"
                  />
                  
                  {/* Manual URL inputs */}
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-gray-500">Or add image URLs manually:</p>
                    {productForm.images.map((img, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={img.url}
                            onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                            placeholder="Image URL"
                          />
                        </div>
                        <div className="w-32">
                          <input
                            type="text"
                            value={img.alt}
                            onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                            placeholder="Alt text"
                          />
                        </div>
                        {productForm.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageField(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addImageField}
                      className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                    >
                      <Plus size={16} /> Add another image URL
                    </button>
                  </div>
                </div>

                {/* Product Tags/Flags */}
                <div className="md:col-span-2 mt-4">
                  <h4 className="font-medium text-gray-700 mb-3">Product Flags</h4>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.isActive}
                        onChange={(e) => handleProductFormChange('isActive', e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="text-sm">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.isFeatured}
                        onChange={(e) => handleProductFormChange('isFeatured', e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="text-sm">Featured</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.isBestSeller}
                        onChange={(e) => handleProductFormChange('isBestSeller', e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="text-sm">Best Seller</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.isOrganic}
                        onChange={(e) => handleProductFormChange('isOrganic', e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="text-sm">Organic</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.isNew}
                        onChange={(e) => handleProductFormChange('isNew', e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="text-sm">New Arrival</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowProductModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={saving}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isEditing ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Product Details</h3>
              <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Image */}
                <div className="sm:w-48 flex-shrink-0">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {selectedProduct.images?.[0]?.url ? (
                      <img src={selectedProduct.images[0].url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package size={48} />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Details */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h4 className="text-xl font-semibold">{selectedProduct.name}</h4>
                    <p className="text-sm text-gray-500">SKU: {selectedProduct.sku || 'N/A'}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary-600">₹{selectedProduct.price}</span>
                    {selectedProduct.discount > 0 && (
                      <>
                        <span className="text-gray-400 line-through">₹{selectedProduct.originalPrice}</span>
                        <span className="text-green-600 text-sm font-medium">{selectedProduct.discount}% OFF</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedProduct.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {selectedProduct.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {selectedProduct.category?.name || 'Uncategorized'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedProduct.stockCount > 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                      Stock: {selectedProduct.stockCount}
                    </span>
                  </div>
                  
                  {selectedProduct.shortDescription && (
                    <p className="text-gray-600 text-sm">{selectedProduct.shortDescription}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {selectedProduct.isFeatured && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">Featured</span>}
                    {selectedProduct.isBestSeller && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">Bestseller</span>}
                    {selectedProduct.isOrganic && <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Organic</span>}
                    {selectedProduct.isNew && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">New</span>}
                  </div>
                  
                  {selectedProduct.description && (
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">Description</h5>
                      <p className="text-gray-600 text-sm">{selectedProduct.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  openEditProductModal(selectedProduct);
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 text-sm"
              >
                <Edit size={16} /> Edit Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Delete Product?</h3>
              <p className="text-gray-600 text-sm mb-6">
                Are you sure you want to delete "{selectedProduct.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedProduct(null);
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProduct}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order View Modal */}
      {showOrderViewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Order Details</h3>
              <button 
                onClick={() => {
                  setShowOrderViewModal(false);
                  setSelectedOrder(null);
                }} 
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-mono font-semibold">{selectedOrder.orderNumber || selectedOrder.id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(selectedOrder.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    orderStatuses.find(s => s.value === selectedOrder.status)?.color || 'bg-gray-100 text-gray-700'
                  }`}>
                    {orderStatuses.find(s => s.value === selectedOrder.status)?.label || selectedOrder.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedOrder.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                    selectedOrder.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    Payment: {selectedOrder.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Users size={16} /> Customer Information
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                    <p className="font-medium">{selectedOrder.user?.name || 'Guest'}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.user?.email || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.user?.phone || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} /> Delivery Address
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    {selectedOrder.deliveryAddress ? (
                      <div className="text-sm space-y-1">
                        <p className="font-medium">{selectedOrder.deliveryAddress.name || selectedOrder.deliveryAddress.label}</p>
                        <p className="text-gray-600">{selectedOrder.deliveryAddress.street}</p>
                        <p className="text-gray-600">
                          {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.postalCode}
                        </p>
                        {selectedOrder.deliveryAddress.phone && (
                          <p className="text-gray-600">Phone: {selectedOrder.deliveryAddress.phone}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No address provided</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Package size={16} /> Order Items ({selectedOrder.items?.length || 0})
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-left">
                      <tr>
                        <th className="px-3 py-2 text-sm font-medium text-gray-600">Product</th>
                        <th className="px-3 py-2 text-sm font-medium text-gray-600 text-center">Qty</th>
                        <th className="px-3 py-2 text-sm font-medium text-gray-600 text-right">Price</th>
                        <th className="px-3 py-2 text-sm font-medium text-gray-600 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedOrder.items?.map((item: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              {item.product?.images?.[0]?.url ? (
                                <img 
                                  src={item.product.images[0].url} 
                                  alt={item.product.name} 
                                  className="w-10 h-10 rounded object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                  <Package size={16} className="text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-sm">{item.product?.name || item.productName || 'Product'}</p>
                                <p className="text-xs text-gray-500">{item.product?.unit || ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center">{item.quantity}</td>
                          <td className="px-3 py-2 text-right text-sm">₹{item.price}</td>
                          <td className="px-3 py-2 text-right font-medium">₹{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{selectedOrder.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span>₹{selectedOrder.deliveryFee?.toFixed(2) || '0.00'}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{selectedOrder.discount?.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedOrder.walletUsed > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Wallet Used</span>
                      <span>-₹{selectedOrder.walletUsed?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-base pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary-600">₹{selectedOrder.total?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Payment Method:</span> {selectedOrder.paymentMethod || 'N/A'}
                  </p>
                  {selectedOrder.deliverySlot && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Delivery Slot:</span> {selectedOrder.deliverySlot.date} ({selectedOrder.deliverySlot.timeSlot})
                    </p>
                  )}
                  {selectedOrder.notes && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Notes:</span> {selectedOrder.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => {
                  setShowOrderViewModal(false);
                  openOrderStatusModal(selectedOrder);
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 text-sm"
              >
                <Edit size={16} /> Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Status Update Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Update Order Status</h3>
              <button 
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedOrder(null);
                }} 
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Order ID</p>
                <p className="font-mono font-semibold">{selectedOrder.orderNumber || selectedOrder.id.slice(-8).toUpperCase()}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Current Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  orderStatuses.find(s => s.value === selectedOrder.status)?.color || 'bg-gray-100 text-gray-700'
                }`}>
                  {orderStatuses.find(s => s.value === selectedOrder.status)?.label || selectedOrder.status}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Change Status To</p>
                <div className="grid grid-cols-2 gap-2">
                  {orderStatuses.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => updateOrderStatus(status.value)}
                      disabled={updatingOrderStatus || selectedOrder.status === status.value}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedOrder.status === status.value 
                          ? 'ring-2 ring-primary-500 opacity-50 cursor-not-allowed' 
                          : 'hover:scale-105 hover:shadow-md'
                      } ${status.color}`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              {updatingOrderStatus && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </div>
              )}
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedOrder(null);
                }}
                disabled={updatingOrderStatus}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {isEditingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => handleCategoryFormChange('name', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="Enter category name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => handleCategoryFormChange('slug', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="category-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => handleCategoryFormChange('description', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  rows={3}
                  placeholder="Category description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => handleCategoryFormChange('icon', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="🍎"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={categoryForm.sortOrder}
                    onChange={(e) => handleCategoryFormChange('sortOrder', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={categoryForm.image}
                  onChange={(e) => handleCategoryFormChange('image', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select
                  value={categoryForm.parentId}
                  onChange={(e) => handleCategoryFormChange('parentId', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="">None (Top Level)</option>
                  {categories.filter((c: any) => c.id !== categoryForm.id).map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={categoryForm.isActive}
                  onChange={(e) => handleCategoryFormChange('isActive', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm">Active</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={savingCategory}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                {savingCategory ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isEditingCategory ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {showDeleteCategoryModal && selectedCategory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Delete Category?</h3>
              <p className="text-gray-600 text-sm mb-6">
                Are you sure you want to delete "{selectedCategory.name}"? 
                {(selectedCategory._count?.products > 0) && (
                  <span className="block mt-2 text-red-600">
                    Warning: This category has {selectedCategory._count.products} products.
                  </span>
                )}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowDeleteCategoryModal(false);
                    setSelectedCategory(null);
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCategory}
                  disabled={deletingCategory}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  {deletingCategory ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {isEditingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
              </h3>
              <button onClick={() => setShowCouponModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  value={couponForm.code}
                  onChange={(e) => handleCouponFormChange('code', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm font-mono uppercase"
                  placeholder="SAVE20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={couponForm.description}
                  onChange={(e) => handleCouponFormChange('description', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="Get 20% off on your order"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                  <select
                    value={couponForm.type}
                    onChange={(e) => handleCouponFormChange('type', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed Amount</option>
                    <option value="FREE_DELIVERY">Free Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value {couponForm.type === 'PERCENTAGE' ? '(%)' : couponForm.type === 'FIXED' ? '(₹)' : ''}
                  </label>
                  <input
                    type="number"
                    value={couponForm.value}
                    onChange={(e) => handleCouponFormChange('value', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    min="0"
                    max={couponForm.type === 'PERCENTAGE' ? 100 : undefined}
                    disabled={couponForm.type === 'FREE_DELIVERY'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={couponForm.minOrderAmount}
                    onChange={(e) => handleCouponFormChange('minOrderAmount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    min="0"
                    placeholder="0 = No minimum"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (₹)</label>
                  <input
                    type="number"
                    value={couponForm.maxDiscount}
                    onChange={(e) => handleCouponFormChange('maxDiscount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    min="0"
                    placeholder="0 = No limit"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={couponForm.usageLimit}
                    onChange={(e) => handleCouponFormChange('usageLimit', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    min="0"
                    placeholder="0 = Unlimited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Per User Limit</label>
                  <input
                    type="number"
                    value={couponForm.perUserLimit}
                    onChange={(e) => handleCouponFormChange('perUserLimit', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid From *</label>
                  <input
                    type="date"
                    value={couponForm.validFrom}
                    onChange={(e) => handleCouponFormChange('validFrom', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until *</label>
                  <input
                    type="date"
                    value={couponForm.validUntil}
                    onChange={(e) => handleCouponFormChange('validUntil', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={couponForm.isActive}
                  onChange={(e) => handleCouponFormChange('isActive', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm">Active</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowCouponModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCoupon}
                disabled={savingCoupon}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                {savingCoupon ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isEditingCoupon ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Coupon Modal */}
      {showDeleteCouponModal && selectedCoupon && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Delete Coupon?</h3>
              <p className="text-gray-600 text-sm mb-6">
                Are you sure you want to delete coupon "{selectedCoupon.code}"?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowDeleteCouponModal(false);
                    setSelectedCoupon(null);
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCoupon}
                  disabled={deletingCoupon}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  {deletingCoupon ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Customer Details</h3>
              <button 
                onClick={() => {
                  setShowCustomerModal(false);
                  setSelectedCustomer(null);
                  setCustomerOrders([]);
                }} 
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Customer Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600">
                    {selectedCustomer.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold">{selectedCustomer.name || 'No name'}</h4>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={14} /> {selectedCustomer.email}
                  </div>
                  {selectedCustomer.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={14} /> {selectedCustomer.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-primary-600">{selectedCustomer._count?.orders || 0}</p>
                  <p className="text-xs text-gray-500">Total Orders</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">₹{selectedCustomer.wallet?.balance || 0}</p>
                  <p className="text-xs text-gray-500">Wallet Balance</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-600">
                    {new Date(selectedCustomer.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-500">Member Since</p>
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <h5 className="font-semibold mb-3">Recent Orders</h5>
                {loadingCustomerDetails ? (
                  <div className="text-center py-8">
                    <Loader2 className="animate-spin mx-auto text-primary-600" size={24} />
                  </div>
                ) : customerOrders.length > 0 ? (
                  <div className="space-y-2">
                    {customerOrders.slice(0, 10).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">#{order.orderNumber || order.id.slice(-8).toUpperCase()}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{order.total}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4 text-sm">No orders yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
