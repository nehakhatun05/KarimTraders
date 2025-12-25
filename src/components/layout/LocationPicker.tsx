'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, X, Search, Clock, CheckCircle, Loader2, Navigation, AlertCircle, MapPinOff } from 'lucide-react';
import ServiceUnavailableModal from '../ui/ServiceUnavailableModal';

interface Location {
  pincode: string;
  area: string;
  city: string;
  state: string;
  deliveryTime: string;
  isServiceable: boolean;
  lat?: number;
  lng?: number;
}

interface ServiceAreaResponse {
  isServiceable: boolean;
  serviceArea: {
    pincode: string;
    area: string;
    city: string;
    state: string;
    deliveryTime: string;
    deliveryFee: number;
    minOrderValue: number;
  } | null;
}

export default function LocationPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [unavailableLocation, setUnavailableLocation] = useState<{ location?: string; pincode?: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load saved location from localStorage
    const saved = localStorage.getItem('userLocation');
    if (saved) {
      const parsedLocation = JSON.parse(saved);
      setCurrentLocation(parsedLocation);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if pincode is in service area
  const checkServiceArea = async (pincode: string): Promise<ServiceAreaResponse> => {
    try {
      const response = await fetch(`/api/service-areas?pincode=${pincode}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking service area:', error);
      // Default to not serviceable if API fails
      return { isServiceable: false, serviceArea: null };
    }
  };

  const handleSelectLocation = async (location: Location, skipServiceCheck = false) => {
    if (!skipServiceCheck && location.pincode && location.pincode !== 'Detected' && location.pincode !== 'N/A') {
      // Check if this pincode is serviceable
      const serviceResponse = await checkServiceArea(location.pincode);
      
      if (!serviceResponse.isServiceable) {
        // Show unavailable modal
        setUnavailableLocation({
          location: `${location.area}, ${location.city}`,
          pincode: location.pincode,
        });
        setShowUnavailableModal(true);
        
        // Update location but mark as not serviceable
        const unserviceableLocation = {
          ...location,
          isServiceable: false,
        };
        setCurrentLocation(unserviceableLocation);
        localStorage.setItem('userLocation', JSON.stringify(unserviceableLocation));
        setIsOpen(false);
        setSearchQuery('');
        return;
      }
      
      // If serviceable, use the service area data
      if (serviceResponse.serviceArea) {
        location = {
          ...location,
          deliveryTime: serviceResponse.serviceArea.deliveryTime,
          isServiceable: true,
        };
      }
    }
    
    const serviceableLocation = {
      ...location,
      isServiceable: true,
    };
    
    setCurrentLocation(serviceableLocation);
    localStorage.setItem('userLocation', JSON.stringify(serviceableLocation));
    setIsOpen(false);
    setSearchQuery('');
    setLocationError(null);
  };

  const handlePincodeSearch = async () => {
    if (searchQuery.length !== 6) return;
    
    setIsLoading(true);
    setLocationError(null);
    
    try {
      // First check if this pincode is in our service area
      const serviceResponse = await checkServiceArea(searchQuery);
      
      // Use India Post API to get pincode details
      const response = await fetch(`https://api.postalpincode.in/pincode/${searchQuery}`);
      const data = await response.json();
      
      if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        const location: Location = {
          pincode: searchQuery,
          area: postOffice.Name,
          city: postOffice.District,
          state: postOffice.State,
          deliveryTime: serviceResponse.serviceArea?.deliveryTime || '30 mins',
          isServiceable: serviceResponse.isServiceable,
        };
        
        if (!serviceResponse.isServiceable) {
          // Show unavailable modal
          setUnavailableLocation({
            location: `${location.area}, ${location.city}`,
            pincode: searchQuery,
          });
          setShowUnavailableModal(true);
          
          // Save location but mark as not serviceable
          setCurrentLocation(location);
          localStorage.setItem('userLocation', JSON.stringify(location));
          setIsOpen(false);
          setSearchQuery('');
        } else {
          await handleSelectLocation(location, true);
        }
      } else {
        setLocationError('Pincode not found. Please try another.');
      }
    } catch (error) {
      console.error('Pincode search error:', error);
      setLocationError('Unable to verify pincode. Please try again.');
    }
    setIsLoading(false);
  };

  // Reverse geocode coordinates to get address
  const reverseGeocode = async (lat: number, lng: number): Promise<Location | null> => {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        return {
          pincode: address.postcode || 'N/A',
          area: address.suburb || address.neighbourhood || address.village || address.town || address.city_district || 'Your Area',
          city: address.city || address.town || address.village || address.state_district || 'Your City',
          state: address.state || 'India',
          deliveryTime: '20-30 mins',
          isServiceable: true, // Will be verified in handleSelectLocation
          lat,
          lng,
        };
      }
      return null;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return null;
    }
  };

  const detectCurrentLocation = async () => {
    setDetectingLocation(true);
    setLocationError(null);

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setDetectingLocation(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocode to get address
      const location = await reverseGeocode(latitude, longitude);
      
      if (location) {
        // This will check service area and show modal if not serviceable
        await handleSelectLocation(location);
      } else {
        // Fallback if reverse geocoding fails
        const fallbackLocation: Location = {
          pincode: 'Detected',
          area: 'Current Location',
          city: 'Nearby',
          state: 'India',
          deliveryTime: '20-30 mins',
          isServiceable: false, // Can't verify without pincode
          lat: latitude,
          lng: longitude,
        };
        
        setCurrentLocation(fallbackLocation);
        localStorage.setItem('userLocation', JSON.stringify(fallbackLocation));
        setIsOpen(false);
        
        // Show modal for unverified location
        setUnavailableLocation({
          location: 'Current Location',
        });
        setShowUnavailableModal(true);
      }
    } catch (error: any) {
      console.error('Location detection error:', error);
      
      let errorMessage = 'Unable to detect location. Please try again.';
      
      if (error.code === 1) {
        errorMessage = 'Location access denied. Please enable location in browser settings.';
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Please try again.';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Please try again.';
      }
      
      setLocationError(errorMessage);
    }
    
    setDetectingLocation(false);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-100 rounded-lg transition-colors group"
        >
          <MapPin size={18} className={`flex-shrink-0 ${currentLocation?.isServiceable === false ? 'text-red-500' : 'text-primary-600'}`} />
          <div className="text-left">
            <p className="text-[10px] text-gray-500 leading-tight hidden sm:block">Deliver to</p>
            <div className="flex items-center gap-1">
              <p className={`text-xs sm:text-sm font-semibold truncate max-w-[80px] sm:max-w-[100px] lg:max-w-[150px] ${currentLocation?.isServiceable === false ? 'text-red-600' : 'text-gray-800'}`}>
                {currentLocation ? currentLocation.area : 'Location'}
              </p>
              {currentLocation?.isServiceable === false && (
                <MapPinOff size={12} className="text-red-500" />
              )}
            </div>
          </div>
          <ChevronDown 
            size={16} 
            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Select Delivery Location</h3>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
                <X size={18} />
              </button>
            </div>
            
            {/* Search Input */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setLocationError(null);
                }}
                placeholder="Enter pincode"
                className="w-full pl-10 pr-20 py-2.5 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
                onKeyDown={(e) => e.key === 'Enter' && handlePincodeSearch()}
              />
              <button
                onClick={handlePincodeSearch}
                disabled={searchQuery.length !== 6 || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Check'}
              </button>
            </div>
          </div>

          {/* Location Error */}
          {locationError && (
            <div className="px-4 py-3 bg-red-50 border-b border-red-100 flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{locationError}</p>
            </div>
          )}

          {/* Not Serviceable Warning */}
          {currentLocation && currentLocation.isServiceable === false && (
            <div className="px-4 py-3 bg-orange-50 border-b border-orange-100 flex items-start gap-2">
              <MapPinOff size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800">Location not serviceable</p>
                <p className="text-xs text-orange-600 mt-0.5">Please select a different location to place orders</p>
              </div>
            </div>
          )}

          {/* Detect Location */}
          <button
            onClick={detectCurrentLocation}
            disabled={detectingLocation}
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-primary-50 border-b border-gray-100 transition-colors group"
          >
            {detectingLocation ? (
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Loader2 size={20} className="text-primary-600 animate-spin" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Navigation size={18} className="text-white" />
              </div>
            )}
            <div className="text-left flex-1">
              <p className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                {detectingLocation ? 'Detecting your location...' : 'Use Current Location'}
              </p>
              <p className="text-xs text-gray-500">
                {detectingLocation ? 'Please wait' : 'Using GPS for accurate delivery'}
              </p>
            </div>
            {!detectingLocation && (
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
                Recommended
              </span>
            )}
          </button>

          {/* Current Location */}
          {currentLocation && currentLocation.isServiceable !== false && (
            <div className="px-4 py-3 bg-green-50 border-b border-green-100">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-sm font-medium text-green-800">Delivery Location</span>
              </div>
              <p className="text-sm text-gray-700">
                {currentLocation.area}, {currentLocation.city} {currentLocation.pincode !== 'Detected' && currentLocation.pincode !== 'N/A' ? `- ${currentLocation.pincode}` : ''}
              </p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <Clock size={12} />
                Delivery in {currentLocation.deliveryTime}
              </p>
            </div>
          )}
        </div>
      )}
    </div>

    {/* Service Unavailable Modal */}
    <ServiceUnavailableModal
      isOpen={showUnavailableModal}
      onClose={() => {
        setShowUnavailableModal(false);
        setUnavailableLocation(null);
      }}
      location={unavailableLocation?.location}
      pincode={unavailableLocation?.pincode}
    />
  </>
  );
}
