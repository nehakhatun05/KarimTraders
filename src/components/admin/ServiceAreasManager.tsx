'use client';

import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit2, Save, Loader2, Check, AlertCircle, X, Search, Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface ServiceArea {
  id: string;
  pincode: string;
  area: string;
  city: string;
  state: string;
  deliveryTime: string;
  deliveryFee: number;
  minOrderValue: number;
  isActive: boolean;
  createdAt: string;
}

const defaultServiceArea = {
  pincode: '',
  area: '',
  city: '',
  state: '',
  deliveryTime: '30 mins',
  deliveryFee: 0,
  minOrderValue: 0,
  isActive: true,
};

export default function ServiceAreasManager() {
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultServiceArea);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkPincodes, setBulkPincodes] = useState('');
  const [isBulkImporting, setIsBulkImporting] = useState(false);

  // Fetch service areas
  const fetchServiceAreas = async () => {
    try {
      const response = await fetch('/api/service-areas?all=true');
      const data = await response.json();
      setServiceAreas(data.serviceAreas || []);
    } catch (error) {
      toast.error('Failed to fetch service areas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceAreas();
  }, []);

  // Lookup pincode details from India Post API
  const lookupPincode = async (pincode: string) => {
    if (pincode.length !== 6) return;
    
    setIsLookingUp(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      
      if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          area: postOffice.Name || prev.area,
          city: postOffice.District || prev.city,
          state: postOffice.State || prev.state,
        }));
        toast.success('Location details fetched!');
      } else {
        toast.error('Could not find pincode details');
      }
    } catch (error) {
      console.error('Pincode lookup failed:', error);
      toast.error('Failed to lookup pincode');
    } finally {
      setIsLookingUp(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));

    // Auto-lookup when pincode is complete
    if (name === 'pincode' && value.length === 6 && !editingId) {
      lookupPincode(value);
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Add new service area
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pincode || !formData.area || !formData.city || !formData.state) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/service-areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add service area');
      }

      toast.success('Service area added successfully');
      setShowAddForm(false);
      setFormData(defaultServiceArea);
      fetchServiceAreas();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update service area
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/service-areas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...formData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update service area');
      }

      toast.success('Service area updated successfully');
      setEditingId(null);
      setFormData(defaultServiceArea);
      fetchServiceAreas();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete service area
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service area?')) return;

    try {
      const response = await fetch(`/api/service-areas?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete service area');
      }

      toast.success('Service area deleted successfully');
      fetchServiceAreas();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Start editing
  const startEdit = (area: ServiceArea) => {
    setEditingId(area.id);
    setFormData({
      pincode: area.pincode,
      area: area.area,
      city: area.city,
      state: area.state,
      deliveryTime: area.deliveryTime,
      deliveryFee: area.deliveryFee,
      minOrderValue: area.minOrderValue,
      isActive: area.isActive,
    });
    setShowAddForm(false);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setFormData(defaultServiceArea);
  };

  // Toggle service area status
  const toggleStatus = async (area: ServiceArea) => {
    try {
      const response = await fetch('/api/service-areas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: area.id, isActive: !area.isActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success(`Service area ${!area.isActive ? 'activated' : 'deactivated'}`);
      fetchServiceAreas();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Bulk import pincodes
  const handleBulkImport = async () => {
    const pincodes = bulkPincodes
      .split(/[\n,\s]+/)
      .map(p => p.trim())
      .filter(p => p.length === 6 && /^\d+$/.test(p));

    if (pincodes.length === 0) {
      toast.error('No valid pincodes found');
      return;
    }

    // Check for duplicates
    const existingPincodes = serviceAreas.map(a => a.pincode);
    const newPincodes = pincodes.filter(p => !existingPincodes.includes(p));
    const duplicates = pincodes.filter(p => existingPincodes.includes(p));

    if (duplicates.length > 0) {
      toast.error(`${duplicates.length} pincode(s) already exist`);
    }

    if (newPincodes.length === 0) {
      toast.error('All pincodes already exist');
      return;
    }

    setIsBulkImporting(true);
    let successCount = 0;
    let failCount = 0;

    for (const pincode of newPincodes) {
      try {
        // Lookup pincode details
        const lookupRes = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const lookupData = await lookupRes.json();
        
        let area = '', city = '', state = '';
        if (lookupData[0]?.Status === 'Success' && lookupData[0]?.PostOffice?.length > 0) {
          const postOffice = lookupData[0].PostOffice[0];
          area = postOffice.Name || '';
          city = postOffice.District || '';
          state = postOffice.State || '';
        }

        // Add service area
        const response = await fetch('/api/service-areas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pincode,
            area: area || 'Unknown',
            city: city || 'Unknown',
            state: state || 'Unknown',
            deliveryTime: '30 mins',
            deliveryFee: 0,
            minOrderValue: 0,
            isActive: true,
          }),
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
      }
    }

    setIsBulkImporting(false);
    setBulkPincodes('');
    setShowBulkImport(false);
    fetchServiceAreas();

    if (successCount > 0) {
      toast.success(`${successCount} service area(s) added successfully`);
    }
    if (failCount > 0) {
      toast.error(`${failCount} pincode(s) failed to add`);
    }
  };

  // Export service areas
  const exportServiceAreas = () => {
    const csvContent = [
      ['Pincode', 'Area', 'City', 'State', 'Delivery Time', 'Delivery Fee', 'Min Order', 'Status'],
      ...serviceAreas.map(area => [
        area.pincode,
        area.area,
        area.city,
        area.state,
        area.deliveryTime,
        area.deliveryFee,
        area.minOrderValue,
        area.isActive ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'service-areas.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Service areas exported!');
  };

  // Filter service areas
  const filteredAreas = serviceAreas.filter(area => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      area.pincode.includes(query) ||
      area.area.toLowerCase().includes(query) ||
      area.city.toLowerCase().includes(query) ||
      area.state.toLowerCase().includes(query)
    );
  });

  // Form component
  const ServiceAreaForm = ({ onSubmit, isEdit = false }: { onSubmit: (e: React.FormEvent) => void; isEdit?: boolean }) => (
    <form onSubmit={onSubmit} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {isEdit ? 'Edit Service Area' : 'Add New Service Area'}
        </h3>
        <button
          type="button"
          onClick={() => {
            if (isEdit) {
              cancelEdit();
            } else {
              setShowAddForm(false);
              setFormData(defaultServiceArea);
            }
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      {!isEdit && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-green-700">
            💡 <strong>Tip:</strong> Enter a 6-digit pincode and we'll auto-fill the area, city, and state!
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pincode <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              maxLength={6}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="400001"
              disabled={isEdit}
              required
            />
            {isLookingUp && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 size={16} className="animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Area <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="area"
            value={formData.area}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="Fort"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="Mumbai"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="Maharashtra"
            required
          />
        </div>
      </div>

      {/* Second Row - Optional Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Time
          </label>
          <select
            name="deliveryTime"
            value={formData.deliveryTime}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="10 mins">10 mins</option>
            <option value="15 mins">15 mins</option>
            <option value="20 mins">20 mins</option>
            <option value="30 mins">30 mins</option>
            <option value="45 mins">45 mins</option>
            <option value="1 hour">1 hour</option>
            <option value="Same Day">Same Day</option>
            <option value="Next Day">Next Day</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Fee (₹)
          </label>
          <input
            type="number"
            name="deliveryFee"
            value={formData.deliveryFee}
            onChange={handleInputChange}
            min="0"
            step="1"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Order (₹)
          </label>
          <input
            type="number"
            name="minOrderValue"
            value={formData.minOrderValue}
            onChange={handleInputChange}
            min="0"
            step="1"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="0"
          />
        </div>

        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
        </div>
      </div>

      {/* Action Buttons - Always Visible */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => {
            if (isEdit) {
              cancelEdit();
            } else {
              setShowAddForm(false);
              setFormData(defaultServiceArea);
            }
          }}
          className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.pincode || !formData.area || !formData.city || !formData.state}
          className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {isEdit ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            <>
              <Save size={18} />
              {isEdit ? 'Update Service Area' : 'Add Service Area'}
            </>
          )}
        </button>
      </div>
    </form>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Service Areas</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {serviceAreas.length} locations • {serviceAreas.filter(a => a.isActive).length} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          {serviceAreas.length > 0 && (
            <button
              onClick={exportServiceAreas}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              title="Export CSV"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
          {!showAddForm && !editingId && (
            <>
              <button
                onClick={() => setShowBulkImport(true)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Upload size={16} />
                <span className="hidden sm:inline">Bulk Import</span>
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
              >
                <Plus size={18} />
                Add Area
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {serviceAreas.length > 0 && !showAddForm && !editingId && (
        <div className="mb-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by pincode, area, city or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Bulk Import Pincodes</h3>
              <p className="text-sm text-gray-500 mt-1">Add multiple pincodes at once</p>
            </div>
            <button
              onClick={() => {
                setShowBulkImport(false);
                setBulkPincodes('');
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-700">
              Enter pincodes separated by commas, spaces, or new lines. We'll automatically fetch location details for each pincode.
            </p>
          </div>

          <textarea
            value={bulkPincodes}
            onChange={(e) => setBulkPincodes(e.target.value)}
            placeholder="400001, 400002, 400003&#10;or&#10;400001&#10;400002&#10;400003"
            className="w-full h-40 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-mono text-sm"
          />

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => {
                setShowBulkImport(false);
                setBulkPincodes('');
              }}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkImport}
              disabled={isBulkImporting || !bulkPincodes.trim()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isBulkImporting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Import Pincodes
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="text-sm text-blue-800 font-medium">Service Area Configuration</p>
          <p className="text-sm text-blue-600 mt-1">
            Add pincodes where you offer delivery. Users outside these areas will see "Coming Soon" message.
          </p>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && <ServiceAreaForm onSubmit={handleAdd} />}

      {/* Edit Form */}
      {editingId && <ServiceAreaForm onSubmit={handleUpdate} isEdit />}

      {/* Service Areas List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : serviceAreas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MapPin className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Service Areas</h3>
          <p className="text-gray-500 mb-4">Start by adding your first service area</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus size={18} />
            Add Service Area
          </button>
        </div>
      ) : filteredAreas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Search className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Results Found</h3>
          <p className="text-gray-500 mb-4">No service areas match "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery('')}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {searchQuery && (
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
              Showing {filteredAreas.length} of {serviceAreas.length} service areas
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Pincode</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Area</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">City</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Delivery</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Fee</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-right px-4 sm:px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAreas.map((area) => (
                  <tr key={area.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4">
                      <span className="font-mono font-semibold text-gray-800">{area.pincode}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div>
                        <p className="text-gray-800 font-medium">{area.area}</p>
                        <p className="text-xs text-gray-500 sm:hidden">{area.city}</p>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-gray-600 hidden sm:table-cell">{area.city}</td>
                    <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-primary-600 font-medium">{area.deliveryTime}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                      {area.deliveryFee > 0 ? (
                        <span className="text-gray-700">₹{area.deliveryFee}</span>
                      ) : (
                        <span className="text-green-600 font-medium">Free</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <button
                        onClick={() => toggleStatus(area)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          area.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {area.isActive ? (
                          <>
                            <Check size={10} />
                            Active
                          </>
                        ) : (
                          'Inactive'
                        )}
                      </button>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(area)}
                          className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(area.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Stats Footer */}
          <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-4 text-sm text-gray-600">
            <span>
              <strong className="text-gray-800">{serviceAreas.filter(a => a.deliveryFee === 0).length}</strong> free delivery
            </span>
            <span>
              <strong className="text-gray-800">{serviceAreas.filter(a => a.deliveryFee > 0).length}</strong> paid delivery
            </span>
            <span>
              <strong className="text-gray-800">{new Set(serviceAreas.map(a => a.city)).size}</strong> cities covered
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
