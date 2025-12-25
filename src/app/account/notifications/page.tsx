'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Package, 
  Gift, 
  Truck, 
  CreditCard, 
  Wallet, 
  Info, 
  Trash2,
  Filter,
  Search
} from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'ORDER' | 'PROMOTION' | 'SYSTEM' | 'DELIVERY' | 'PAYMENT' | 'WALLET';
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    notifications, 
    unreadCount, 
    setNotifications, 
    markAsRead, 
    markAllAsRead,
    removeNotification 
  } = useNotificationStore();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!session?.user) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/notifications?limit=50');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session]);

  // Mark notification as read
  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [id] }),
      });
      
      if (res.ok) {
        markAsRead(id);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      
      if (res.ok) {
        markAllAsRead();
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Delete notification
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/user/notifications?id=${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        removeNotification(id);
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return <Package size={20} className="text-blue-500" />;
      case 'PROMOTION':
        return <Gift size={20} className="text-pink-500" />;
      case 'DELIVERY':
        return <Truck size={20} className="text-green-500" />;
      case 'PAYMENT':
        return <CreditCard size={20} className="text-purple-500" />;
      case 'WALLET':
        return <Wallet size={20} className="text-amber-500" />;
      default:
        return <Info size={20} className="text-gray-500" />;
    }
  };

  // Get notification link
  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case 'ORDER':
      case 'DELIVERY':
        return notification.data?.orderId ? `/account/orders/${notification.data.orderId}` : '/account/orders';
      case 'WALLET':
        return '/account/wallet';
      case 'PROMOTION':
        return notification.data?.promoLink || '/offers';
      default:
        return null;
    }
  };

  // Filter and search notifications
  const filteredNotifications = notifications.filter(notification => {
    // Filter by type
    if (filter !== 'all' && notification.type !== filter) return false;
    
    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateKey: string;
    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Yesterday';
    } else {
      dateKey = format(date, 'MMMM d, yyyy');
    }
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Bell size={24} className="text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
                <p className="text-sm text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors font-medium"
              >
                <CheckCheck size={18} />
                Mark all as read
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="all">All Types</option>
                <option value="ORDER">Orders</option>
                <option value="DELIVERY">Delivery</option>
                <option value="PROMOTION">Promotions</option>
                <option value="PAYMENT">Payments</option>
                <option value="WALLET">Wallet</option>
                <option value="SYSTEM">System</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {searchQuery || filter !== 'all' ? 'No notifications found' : 'No notifications yet'}
            </h3>
            <p className="text-gray-500">
              {searchQuery || filter !== 'all' 
                ? 'Try adjusting your search or filters'
                : "We'll notify you about your orders, offers, and more"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-gray-500 mb-3 px-2">{date}</h3>
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
                  {dateNotifications.map((notification) => {
                    const link = getNotificationLink(notification);
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.isRead ? 'bg-primary-50/30' : ''
                        }`}
                      >
                        <div className="flex gap-4">
                          {/* Icon */}
                          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                            notification.isRead ? 'bg-gray-100' : 'bg-white shadow-sm border border-gray-100'
                          }`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className={`font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                                    {notification.title}
                                  </p>
                                  {!notification.isRead && (
                                    <span className="w-2 h-2 bg-primary-500 rounded-full" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                {!notification.isRead && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                    title="Mark as read"
                                  >
                                    <Check size={18} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(notification.id)}
                                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                                {link && (
                                  <Link
                                    href={link}
                                    className="px-3 py-1.5 bg-primary-50 text-primary-600 text-sm font-medium rounded-lg hover:bg-primary-100 transition-colors"
                                  >
                                    View
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
