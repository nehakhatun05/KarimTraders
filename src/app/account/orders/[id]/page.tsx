'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Package, 
  ChevronRight,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  ArrowLeft,
  FileText,
  Box,
  ShoppingBag
} from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    slug: string;
    unit: string;
    images: { url: string }[];
  };
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  walletUsed: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveredAt: string | null;
  notes: string | null;
  deliveryAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
  } | null;
  deliverySlot: {
    date: string;
    timeSlot: string;
  } | null;
  items: OrderItem[];
  statusHistory?: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
}

const orderStatuses = [
  { value: 'PENDING', label: 'Order Placed', icon: ShoppingBag, description: 'Your order has been placed' },
  { value: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle, description: 'Order confirmed by seller' },
  { value: 'PROCESSING', label: 'Processing', icon: Box, description: 'Order is being prepared' },
  { value: 'SHIPPED', label: 'Shipped', icon: Package, description: 'Order has been shipped' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck, description: 'Order is on the way' },
  { value: 'DELIVERED', label: 'Delivered', icon: CheckCircle, description: 'Order delivered successfully' },
];

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  CONFIRMED: 'bg-blue-500',
  PROCESSING: 'bg-blue-500',
  SHIPPED: 'bg-purple-500',
  OUT_FOR_DELIVERY: 'bg-orange-500',
  DELIVERED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
};

export default function OrderDetailPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login?callbackUrl=/account/orders');
      return;
    }

    if (authStatus === 'authenticated' && orderId) {
      fetchOrder();
    }
  }, [authStatus, router, orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        toast.error('Order not found');
        router.push('/account/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    if (status === 'CANCELLED') return -1;
    return orderStatuses.findIndex(s => s.value === status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <ChevronRight size={16} />
            <Link href="/account" className="hover:text-primary-600">Account</Link>
            <ChevronRight size={16} />
            <Link href="/account/orders" className="hover:text-primary-600">Orders</Link>
            <ChevronRight size={16} />
            <span className="text-gray-800">#{order.orderNumber || order.id.slice(-8).toUpperCase()}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/account/orders"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Order #{order.orderNumber || order.id.slice(-8).toUpperCase()}
                </h1>
                <p className="text-sm text-gray-500">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              isCancelled ? 'bg-red-100 text-red-700' :
              order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {isCancelled ? 'Cancelled' : orderStatuses.find(s => s.value === order.status)?.label || order.status}
            </span>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-6">Order Timeline</h2>
              
              {isCancelled ? (
                <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="text-red-600" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-red-700">Order Cancelled</p>
                    <p className="text-sm text-red-600">
                      This order was cancelled on {formatDate(order.updatedAt)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200" />
                  <div 
                    className={`absolute left-6 top-6 w-0.5 ${statusColors[order.status]} transition-all duration-500`}
                    style={{ 
                      height: `${Math.max(0, (currentStatusIndex / (orderStatuses.length - 1)) * 100)}%`,
                      maxHeight: 'calc(100% - 48px)'
                    }}
                  />

                  {/* Timeline Items */}
                  <div className="space-y-6">
                    {orderStatuses.map((status, index) => {
                      const isCompleted = currentStatusIndex >= index;
                      const isCurrent = currentStatusIndex === index;
                      const Icon = status.icon;
                      
                      // Get timestamp from status history if available
                      const historyEntry = order.statusHistory?.find(h => h.status === status.value);
                      const timestamp = status.value === 'PENDING' ? order.createdAt : 
                                       status.value === 'DELIVERED' && order.deliveredAt ? order.deliveredAt :
                                       historyEntry?.timestamp;
                      
                      return (
                        <div key={status.value} className="relative flex items-start gap-4">
                          {/* Icon Circle */}
                          <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all
                            ${isCompleted 
                              ? `${statusColors[status.value]} text-white` 
                              : 'bg-gray-100 text-gray-400'
                            }
                            ${isCurrent ? 'ring-4 ring-offset-2 ring-primary-200' : ''}
                          `}>
                            <Icon size={20} />
                          </div>
                          
                          {/* Content */}
                          <div className={`flex-1 pt-1 ${!isCompleted ? 'opacity-50' : ''}`}>
                            <div className="flex items-center justify-between">
                              <h3 className={`font-semibold ${isCompleted ? 'text-gray-800' : 'text-gray-500'}`}>
                                {status.label}
                              </h3>
                              {timestamp && isCompleted && (
                                <span className="text-xs text-gray-500">
                                  {formatDate(timestamp)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {status.description}
                            </p>
                            {isCurrent && !isCancelled && (
                              <span className="inline-block mt-2 px-2 py-0.5 bg-primary-100 text-primary-600 text-xs rounded-full">
                                Current Status
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Order Items ({order.items.length})</h2>
              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.images?.[0]?.url ? (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="text-gray-400" size={32} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Link 
                        href={`/products/${item.product.slug}`}
                        className="font-medium text-gray-800 hover:text-primary-600"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.product.unit} × {item.quantity}
                      </p>
                      <p className="font-semibold text-primary-600 mt-1">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{order.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee?.toFixed(2)}`}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount?.toFixed(2)}</span>
                  </div>
                )}
                {order.walletUsed > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Wallet Used</span>
                    <span>-₹{order.walletUsed?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base pt-3 border-t">
                  <span>Total</span>
                  <span className="text-primary-600">₹{order.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard size={20} />
                Payment
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method</span>
                  <span className="font-medium">{order.paymentMethod || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${
                    order.paymentStatus === 'PAID' ? 'text-green-600' :
                    order.paymentStatus === 'PENDING' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            {order.deliveryAddress && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin size={20} />
                  Delivery Address
                </h2>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.deliveryAddress.name}</p>
                  <p className="text-gray-600">{order.deliveryAddress.street}</p>
                  <p className="text-gray-600">
                    {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.postalCode}
                  </p>
                  {order.deliveryAddress.phone && (
                    <p className="text-gray-600 flex items-center gap-1 mt-2">
                      <Phone size={14} />
                      {order.deliveryAddress.phone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Slot */}
            {order.deliverySlot && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar size={20} />
                  Delivery Slot
                </h2>
                <div className="text-sm">
                  <p className="font-medium">{order.deliverySlot.date}</p>
                  <p className="text-gray-600">{order.deliverySlot.timeSlot}</p>
                </div>
              </div>
            )}

            {/* Order Notes */}
            {order.notes && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Order Notes
                </h2>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Link 
                href="/account/orders"
                className="w-full btn-outline flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                Back to Orders
              </Link>
              {order.status === 'DELIVERED' && (
                <button className="w-full btn-primary">
                  Reorder Items
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
