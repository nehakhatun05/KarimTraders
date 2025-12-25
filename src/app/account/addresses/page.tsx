'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Home, 
  Briefcase, 
  Star,
  ChevronRight,
  Check,
  X,
  Loader2,
  Navigation,
  LocateFixed
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Address {
  id: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [formData, setFormData] = useState<Partial<Address>>({
    type: 'HOME',
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login?callbackUrl=/account/addresses');
      return;
    }

    if (authStatus === 'authenticated') {
      fetchAddresses();
    }
  }, [authStatus, router]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data || []);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const url = editingAddress 
        ? `/api/user/addresses/${editingAddress.id}` 
        : '/api/user/addresses';
      
      const method = editingAddress ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        toast.success(editingAddress ? 'Address updated successfully' : 'Address added successfully');
        fetchAddresses();
        resetForm();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save address');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingAddress(null);
    setDetectingLocation(false);
    setFormData({
      type: 'HOME',
      name: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false,
    });
  };

  // Detect current location and auto-fill address
  const detectCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setDetectingLocation(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode using OpenStreetMap Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );

      const data = await response.json();

      if (data && data.address) {
        const address = data.address;
        
        // Build address line from available data
        const addressParts = [];
        if (address.house_number) addressParts.push(address.house_number);
        if (address.road) addressParts.push(address.road);
        
        const area = address.suburb || address.neighbourhood || address.village || '';
        
        setFormData(prev => ({
          ...prev,
          addressLine1: addressParts.join(', ') || area || 'Near current location',
          addressLine2: area && addressParts.length > 0 ? area : '',
          city: address.city || address.town || address.village || address.state_district || '',
          state: address.state || '',
          pincode: address.postcode || '',
        }));

        toast.success('Location detected! Please verify and complete the address.');
      } else {
        toast.error('Could not get address details. Please enter manually.');
      }
    } catch (error: any) {
      console.error('Location detection error:', error);
      
      if (error.code === 1) {
        toast.error('Location access denied. Please enable location permissions.');
      } else if (error.code === 2) {
        toast.error('Location unavailable. Please try again.');
      } else if (error.code === 3) {
        toast.error('Location request timed out. Please try again.');
      } else {
        toast.error('Failed to detect location. Please enter address manually.');
      }
    } finally {
      setDetectingLocation(false);
    }
  };

  // Fetch pincode details when pincode is entered
  const handlePincodeChange = async (pincode: string) => {
    setFormData(prev => ({ ...prev, pincode }));
    
    if (pincode.length === 6) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        
        if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const postOffice = data[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            city: prev.city || postOffice.District,
            state: prev.state || postOffice.State,
            addressLine2: prev.addressLine2 || postOffice.Name,
          }));
        }
      } catch (error) {
        console.error('Pincode lookup failed:', error);
      }
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData(address);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        toast.success('Address deleted');
        fetchAddresses();
      } else {
        toast.error('Failed to delete address');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const setAsDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      
      if (res.ok) {
        toast.success('Default address updated');
        fetchAddresses();
      } else {
        toast.error('Failed to update default address');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'HOME': return Home;
      case 'WORK': return Briefcase;
      default: return MapPin;
    }
  };

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return null;
  }

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
            <span className="text-gray-800">My Addresses</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">My Addresses</h1>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              Add Address
            </button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Address Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h2>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Use Current Location Button */}
                {!editingAddress && (
                  <button
                    type="button"
                    onClick={detectCurrentLocation}
                    disabled={detectingLocation}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-primary-300 bg-primary-50 hover:bg-primary-100 rounded-xl text-primary-700 font-medium transition-colors disabled:opacity-50"
                  >
                    {detectingLocation ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Detecting location...
                      </>
                    ) : (
                      <>
                        <LocateFixed size={20} />
                        Use Current Location
                      </>
                    )}
                  </button>
                )}

                {/* Address Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Type
                  </label>
                  <div className="flex gap-3">
                    {[{ value: 'HOME', label: 'Home' }, { value: 'WORK', label: 'Work' }, { value: 'OTHER', label: 'Other' }].map(({ value, label }) => {
                      const Icon = getTypeIcon(value);
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: value as Address['type'] })}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                            formData.type === value
                              ? 'border-primary-600 bg-primary-50 text-primary-600'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon size={18} />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1
                  </label>
                  <textarea
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    className="input"
                    rows={2}
                    placeholder="House/Flat No., Building, Street"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine2 || ''}
                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                    className="input"
                    placeholder="Area, Colony, Sector"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.landmark || ''}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="input"
                    placeholder="Near..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => handlePincodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="input"
                      maxLength={6}
                      pattern="\d{6}"
                      required
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-sm text-gray-600">Set as default address</span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={resetForm} className="flex-1 btn-outline">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-50">
                    {saving ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Addresses Grid */}
        {addresses.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {addresses.map((address) => {
              const TypeIcon = getTypeIcon(address.type);
              return (
                <div
                  key={address.id}
                  className={`bg-white rounded-xl shadow-sm p-6 border-2 ${
                    address.isDefault ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="p-2 bg-gray-100 rounded-lg">
                        <TypeIcon size={20} className="text-gray-600" />
                      </span>
                      <div>
                        <span className="font-semibold text-gray-800 capitalize">{address.type.toLowerCase()}</span>
                        {address.isDefault && (
                          <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-600 text-xs rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(address)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary-600"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-gray-600">
                    <p className="font-medium text-gray-800">{address.name}</p>
                    <p>{address.addressLine1}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    {address.landmark && <p className="text-sm">Near: {address.landmark}</p>}
                    <p>{address.city}, {address.state} - {address.pincode}</p>
                    <p className="text-primary-600">{address.phone}</p>
                  </div>

                  {!address.isDefault && (
                    <button
                      onClick={() => setAsDefault(address.id)}
                      className="mt-4 flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                    >
                      <Star size={16} />
                      Set as Default
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <MapPin size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No addresses saved</h3>
            <p className="text-gray-500 mb-6">Add your delivery addresses for faster checkout</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              Add Your First Address
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
