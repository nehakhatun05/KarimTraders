'use client';

import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit2, Save, X, Loader2, Check, AlertCircle } from 'lucide-react';
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

export default function ServiceAreasPage() {
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultServiceArea);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
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

  // Form component
  const ServiceAreaForm = ({ onSubmit, isEdit = false }: { onSubmit: (e: React.FormEvent) => void; isEdit?: boolean }) => (
    <form onSubmit={onSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {isEdit ? 'Edit Service Area' : 'Add New Service Area'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pincode <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleInputChange}
            maxLength={6}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="400001"
            disabled={isEdit}
          />
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
          />
        </div>

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
            Min Order Value (₹)
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

        <div className="flex items-center">
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

      <div className="flex justify-end gap-3 mt-6">
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
          className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {isEdit ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            <>
              <Save size={16} />
              {isEdit ? 'Update' : 'Add Service Area'}
            </>
          )}
        </button>
      </div>
    </form>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Service Areas</h1>
          <p className="text-gray-500 mt-1">Manage delivery locations and pincodes</p>
        </div>
        {!showAddForm && !editingId && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus size={18} />
            Add Service Area
          </button>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="text-sm text-blue-800 font-medium">Service Area Configuration</p>
          <p className="text-sm text-blue-600 mt-1">
            Add pincodes where you want to offer delivery. Users in these areas can place orders. 
            Users outside these areas will see "Coming Soon" message.
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
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Pincode</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Area</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">City</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">State</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Delivery</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Fee</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {serviceAreas.map((area) => (
                  <tr key={area.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-semibold text-gray-800">{area.pincode}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{area.area}</td>
                    <td className="px-6 py-4 text-gray-600">{area.city}</td>
                    <td className="px-6 py-4 text-gray-600">{area.state}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-primary-600 font-medium">{area.deliveryTime}</span>
                    </td>
                    <td className="px-6 py-4">
                      {area.deliveryFee > 0 ? (
                        <span className="text-gray-700">₹{area.deliveryFee}</span>
                      ) : (
                        <span className="text-green-600 font-medium">Free</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(area)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          area.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {area.isActive ? (
                          <>
                            <Check size={12} />
                            Active
                          </>
                        ) : (
                          'Inactive'
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
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
        </div>
      )}
    </div>
  );
}
