'use client';

import { MapPinOff, X, Bell, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ServiceUnavailableModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: string;
  pincode?: string;
}

export default function ServiceUnavailableModal({
  isOpen,
  onClose,
  location,
  pincode,
}: ServiceUnavailableModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  if (!isOpen) return null;

  const handleNotifyMe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you could save to a waitlist collection
      // For now, just simulate the submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotifySubmitted(true);
      toast.success('We\'ll notify you when we launch in your area!');
    } catch (error) {
      toast.error('Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header with illustration */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 px-6 pt-8 pb-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
            <MapPinOff className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">
            Oops! We're Not Here Yet
          </h2>
          <p className="text-white/90 text-sm">
            But we're expanding fast!
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 -mt-8">
          <div className="bg-white rounded-xl shadow-lg p-5">
            {/* Location info */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 mb-3">
                <MapPinOff className="w-4 h-4 text-gray-500" />
                {location || pincode ? (
                  <span>{location || `Pincode: ${pincode}`}</span>
                ) : (
                  <span>Your location</span>
                )}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Sorry, KARIM TRADERS is currently not available at your location. 
                We're working hard to expand our services to serve you better.
              </p>
            </div>

            {/* Notify me section */}
            {!notifySubmitted ? (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  Get notified when we launch in your area
                </p>
                <form onSubmit={handleNotifyMe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? '...' : 'Notify Me'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="border-t pt-4 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <Bell className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-green-700 font-medium text-sm">
                  You're on the list! We'll notify you soon.
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Change Location
            </button>
          </div>

          {/* Footer note */}
          <p className="text-xs text-gray-400 text-center mt-4">
            Currently serving select areas in India. Check back soon!
          </p>
        </div>
      </div>
    </div>
  );
}
