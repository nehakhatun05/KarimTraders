'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Package, RefreshCw, Mail, ArrowRight, Edit2, Check, X } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  stockCount: number;
  lowStockAlert: number;
  stockStatus: string;
  images: { url: string }[];
  category: { name: string };
}

interface InventoryStats {
  lowStock: number;
  outOfStock: number;
  inStock: number;
}

export default function InventoryAlerts() {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<InventoryStats>({ lowStock: 0, outOfStock: 0, inStock: 0 });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/inventory?includeOutOfStock=true');
      if (res.ok) {
        const data = await res.json();
        setLowStockProducts(data.lowStockProducts);
        setOutOfStockProducts(data.outOfStockProducts);
        setStats(data.summary);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const sendAlert = async (type: 'low_stock' | 'out_of_stock') => {
    setSending(true);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to send alert');
      }
    } catch (error) {
      toast.error('Failed to send alert');
    } finally {
      setSending(false);
    }
  };

  const updateStock = async (productId: string, stockCount: number) => {
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, stockCount }),
      });
      
      if (res.ok) {
        toast.success('Stock updated successfully');
        fetchInventoryData();
        setEditingId(null);
      } else {
        toast.error('Failed to update stock');
      }
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">In Stock</p>
              <p className="text-2xl font-bold text-green-700">{stats.inStock}</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-600 font-medium">Low Stock</p>
              <p className="text-2xl font-bold text-amber-700">{stats.lowStock}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Package className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium">Out of Stock</p>
              <p className="text-2xl font-bold text-red-700">{stats.outOfStock}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={fetchInventoryData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
        {stats.lowStock > 0 && (
          <button
            onClick={() => sendAlert('low_stock')}
            disabled={sending}
            className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50"
          >
            <Mail className="w-4 h-4" />
            Send Low Stock Alert
          </button>
        )}
        {stats.outOfStock > 0 && (
          <button
            onClick={() => sendAlert('out_of_stock')}
            disabled={sending}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
          >
            <Mail className="w-4 h-4" />
            Send Out of Stock Alert
          </button>
        )}
      </div>

      {/* Out of Stock Products */}
      {outOfStockProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-red-50">
            <h3 className="font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Out of Stock Products ({outOfStockProducts.length})
            </h3>
          </div>
          <div className="divide-y">
            {outOfStockProducts.map((product) => (
              <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    SKU: {product.sku} • {product.category?.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {editingId === product.id ? (
                    <>
                      <input
                        type="number"
                        value={editStock}
                        onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border rounded text-center"
                        min="0"
                      />
                      <button
                        onClick={() => updateStock(product.id, editStock)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        0 units
                      </span>
                      <button
                        onClick={() => {
                          setEditingId(product.id);
                          setEditStock(product.stockCount);
                        }}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Stock Products */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-amber-50">
            <h3 className="font-semibold text-amber-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Low Stock Products ({lowStockProducts.length})
            </h3>
          </div>
          <div className="divide-y">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    SKU: {product.sku} • {product.category?.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {editingId === product.id ? (
                    <>
                      <input
                        type="number"
                        value={editStock}
                        onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border rounded text-center"
                        min="0"
                      />
                      <button
                        onClick={() => updateStock(product.id, editStock)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                        {product.stockCount} / {product.lowStockAlert}
                      </span>
                      <button
                        onClick={() => {
                          setEditingId(product.id);
                          setEditStock(product.stockCount);
                        }}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No alerts message */}
      {lowStockProducts.length === 0 && outOfStockProducts.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <Package className="w-12 h-12 mx-auto text-green-600 mb-3" />
          <h3 className="text-lg font-semibold text-green-700 mb-1">All Products Well Stocked!</h3>
          <p className="text-green-600">No inventory alerts at the moment.</p>
        </div>
      )}

      {/* Link to Products */}
      <Link
        href="/admin/products"
        className="flex items-center justify-center gap-2 p-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
      >
        Manage All Products
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
