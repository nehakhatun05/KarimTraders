'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  ChevronRight, 
  MapPin, 
  Clock, 
  CreditCard, 
  Check, 
  Plus,
  Home,
  Briefcase,
  Building,
  Loader2,
  X,
  Wallet
} from 'lucide-react';
import { useCartStore } from '@/store';
import toast from 'react-hot-toast';

type CheckoutStep = 'address' | 'delivery' | 'payment' | 'review';

interface Address {
  id: string;
  type: string;
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

interface DeliverySlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface WalletInfo {
  balance: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, getSubtotal, clearCart } = useCartStore();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>([]);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('COD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: 'HOME',
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [serviceAreaCheck, setServiceAreaCheck] = useState<{
    checking: boolean;
    isServiceable: boolean | null;
    serviceArea: any;
    error?: string;
  }>({ checking: false, isServiceable: null, serviceArea: null });

  // Check service area when address is selected
  const checkServiceArea = async (pincode: string) => {
    setServiceAreaCheck({ checking: true, isServiceable: null, serviceArea: null });
    try {
      const res = await fetch(`/api/service-areas?pincode=${pincode}`);
      const data = await res.json();
      setServiceAreaCheck({
        checking: false,
        isServiceable: data.isServiceable,
        serviceArea: data.serviceArea,
        error: data.isServiceable ? undefined : 'Sorry, we do not deliver to this area yet.',
      });
      return data.isServiceable;
    } catch (error) {
      setServiceAreaCheck({
        checking: false,
        isServiceable: false,
        serviceArea: null,
        error: 'Failed to check service area.',
      });
      return false;
    }
  };

  // Handle address selection with service area check
  const handleAddressSelect = async (addressId: string) => {
    setSelectedAddress(addressId);
    const address = addresses.find(a => a.id === addressId);
    if (address) {
      await checkServiceArea(address.pincode);
    }
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const steps: { id: CheckoutStep; label: string; icon: any }[] = [
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'delivery', label: 'Delivery', icon: Clock },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'review', label: 'Review', icon: Check },
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout');
    }
  }, [status, router]);

  // Fetch user data
  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [addressRes, walletRes, slotsRes] = await Promise.all([
        fetch('/api/user/addresses'),
        fetch('/api/user/wallet'),
        fetch('/api/delivery-slots'),
      ]);

      if (addressRes.ok) {
        const addressData = await addressRes.json();
        setAddresses(addressData);
        const defaultAddr = addressData.find((a: Address) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr.id);
          // Check service area for default address
          checkServiceArea(defaultAddr.pincode);
        } else if (addressData.length > 0) {
          setSelectedAddress(addressData[0].id);
          // Check service area for first address
          checkServiceArea(addressData[0].pincode);
        }
      }

      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setWallet(walletData);
      }

      if (slotsRes.ok) {
        const slotsData = await slotsRes.json();
        setDeliverySlots(slotsData.filter((s: DeliverySlot) => s.isActive));
        if (slotsData.length > 0) {
          setSelectedSlot(slotsData[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load checkout data');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getSubtotal();
  const deliveryCharge = subtotal >= 499 ? 0 : 29;
  const total = subtotal - couponDiscount + deliveryCharge;

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add items to your cart to proceed with checkout</p>
          <Link href="/products" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });

      if (res.ok) {
        const data = await res.json();
        setCouponDiscount(data.discount);
        setAppliedCoupon(couponCode.toUpperCase());
        toast.success(`Coupon applied! You save ₹${data.discount}`);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Invalid coupon code');
      }
    } catch (error) {
      toast.error('Failed to apply coupon');
    }
    setCouponCode('');
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    toast.success('Coupon removed');
  };

  const handleSaveAddress = async () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.addressLine1 || 
        !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error('Please fill all required fields');
      return;
    }

    setSavingAddress(true);
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress),
      });

      if (res.ok) {
        const savedAddress = await res.json();
        setAddresses([...addresses, savedAddress]);
        setSelectedAddress(savedAddress.id);
        // Check service area for newly saved address
        await checkServiceArea(savedAddress.pincode);
        setShowAddressForm(false);
        setNewAddress({
          type: 'HOME',
          name: '',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: '',
          landmark: '',
        });
        toast.success('Address saved successfully');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to save address');
      }
    } catch (error) {
      toast.error('Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const syncCartToDatabase = async () => {
    try {
      // First clear existing cart
      await fetch('/api/cart', { method: 'DELETE' });
      
      // Add current items to database cart
      for (const item of items) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.product.id,
            quantity: item.quantity,
          }),
        });
      }
      return true;
    } catch (error) {
      console.error('Error syncing cart:', error);
      return false;
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      setCurrentStep('address');
      return;
    }

    // Validate service area before placing order
    if (serviceAreaCheck.isServiceable === false) {
      toast.error('We do not deliver to the selected address area. Please choose a different address.');
      setCurrentStep('address');
      return;
    }

    // If service area hasn't been checked, check it now
    if (serviceAreaCheck.isServiceable === null) {
      const address = addresses.find(a => a.id === selectedAddress);
      if (address) {
        const isServiceable = await checkServiceArea(address.pincode);
        if (!isServiceable) {
          toast.error('We do not deliver to the selected address area. Please choose a different address.');
          setCurrentStep('address');
          return;
        }
      }
    }

    setIsProcessing(true);
    
    try {
      // Sync cart to database first
      const syncSuccess = await syncCartToDatabase();
      if (!syncSuccess) {
        toast.error('Failed to sync cart. Please try again.');
        setIsProcessing(false);
        return;
      }

      // Handle online payment
      if (paymentMethod === 'online') {
        if (!razorpayLoaded) {
          toast.error('Payment system loading. Please try again.');
          setIsProcessing(false);
          return;
        }

        // Create order for online payment
        const res = await fetch('/api/orders/online', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            addressId: selectedAddress,
            deliverySlotId: selectedSlot || undefined,
            notes: notes || undefined,
            couponCode: appliedCoupon || undefined,
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          toast.error(error.error || 'Failed to create order');
          setIsProcessing(false);
          return;
        }

        const orderData = await res.json();

        // Open Razorpay checkout
        const options = {
          key: orderData.razorpay.key,
          amount: orderData.razorpay.amount,
          currency: orderData.razorpay.currency,
          name: orderData.razorpay.name,
          description: orderData.razorpay.description,
          order_id: orderData.razorpay.orderId,
          prefill: orderData.razorpay.prefill,
          notes: orderData.razorpay.notes,
          theme: orderData.razorpay.theme,
          handler: async function (response: any) {
            // Verify payment
            try {
              const verifyRes = await fetch('/api/payments/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: orderData.orderId,
                }),
              });

              if (verifyRes.ok) {
                clearCart();
                toast.success('Payment successful! Order placed.');
                router.push(`/order-success?orderId=${orderData.orderNumber}`);
              } else {
                const error = await verifyRes.json();
                toast.error(error.error || 'Payment verification failed');
              }
            } catch (error) {
              toast.error('Payment verification failed. Contact support.');
            }
          },
          modal: {
            ondismiss: async function () {
              // Cancel the pending order if user closes Razorpay
              await fetch(`/api/orders/online?orderId=${orderData.orderId}`, {
                method: 'DELETE',
              });
              setIsProcessing(false);
              toast.error('Payment cancelled');
            },
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.on('payment.failed', async function (response: any) {
          await fetch(`/api/orders/online?orderId=${orderData.orderId}`, {
            method: 'DELETE',
          });
          toast.error(`Payment failed: ${response.error.description}`);
          setIsProcessing(false);
        });
        razorpay.open();
        return;
      }

      // Handle COD and Wallet payments
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: selectedAddress,
          paymentMethod: paymentMethod === 'cod' ? 'COD' : 
                        paymentMethod === 'wallet' ? 'WALLET' : 'ONLINE',
          deliverySlotId: selectedSlot || undefined,
          notes: notes || undefined,
          couponCode: appliedCoupon || undefined,
        }),
      });

      if (res.ok) {
        const order = await res.json();
        clearCart();
        toast.success('Order placed successfully!');
        router.push(`/order-success?orderId=${order.orderNumber}`);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getAddressIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'home': return Home;
      case 'work': return Briefcase;
      default: return Building;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <span className="font-display font-bold text-xl text-gray-800">KARIM TRADERS</span>
            </Link>
            <div className="text-sm text-gray-600">
              Secure Checkout 🔒
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const stepIndex = steps.findIndex(s => s.id === currentStep);
              const isCompleted = steps.findIndex(s => s.id === step.id) < stepIndex;
              const isCurrent = step.id === currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-primary-600 text-white'
                          : isCurrent
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                    </div>
                    <span
                      className={`text-xs mt-1 ${
                        isCurrent ? 'text-primary-600 font-medium' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 sm:w-16 md:w-24 h-1 mx-2 rounded ${
                        isCompleted ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Step */}
            {currentStep === 'address' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Select Delivery Address</h2>
                
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 mb-4">No saved addresses found</p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="btn-primary"
                    >
                      <Plus size={18} className="mr-2" />
                      Add New Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => {
                      const Icon = getAddressIcon(address.type);
                      return (
                        <label
                          key={address.id}
                          className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            selectedAddress === address.id
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <input
                              type="radio"
                              name="address"
                              value={address.id}
                              checked={selectedAddress === address.id}
                              onChange={() => setSelectedAddress(address.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Icon size={16} className="text-gray-500" />
                                <span className="font-medium capitalize">{address.type?.toLowerCase()}</span>
                                {address.isDefault && (
                                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="font-medium text-gray-800">{address.name}</p>
                              <p className="text-gray-600 text-sm">
                                {address.addressLine1}
                                {address.addressLine2 && `, ${address.addressLine2}`}
                              </p>
                              <p className="text-gray-600 text-sm">
                                {address.city}, {address.state} - {address.pincode}
                              </p>
                              <p className="text-gray-600 text-sm mt-1">Phone: {address.phone}</p>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={() => setShowAddressForm(true)}
                  className="mt-4 flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700"
                >
                  <Plus size={18} />
                  Add New Address
                </button>

                <button
                  onClick={() => setCurrentStep('delivery')}
                  className="w-full btn-primary mt-6"
                  disabled={!selectedAddress}
                >
                  Continue to Delivery
                </button>
              </div>
            )}

            {/* Delivery Step */}
            {currentStep === 'delivery' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Select Delivery Slot</h2>
                
                {deliverySlots.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 mb-4">Standard delivery will be applied</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deliverySlots.map((slot) => (
                      <label
                        key={slot.id}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          selectedSlot === slot.id
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            name="slot"
                            value={slot.id}
                            checked={selectedSlot === slot.id}
                            onChange={() => setSelectedSlot(slot.id)}
                          />
                          <div>
                            <p className="font-medium text-gray-800">{slot.name}</p>
                            <p className="text-sm text-gray-500">
                              {slot.startTime} - {slot.endTime}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Order Notes */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions for delivery..."
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setCurrentStep('address')}
                    className="btn-outline"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep('payment')}
                    className="flex-1 btn-primary"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Payment Step */}
            {currentStep === 'payment' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Select Payment Method</h2>
                
                <div className="space-y-3">
                  <label
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'cod'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                      />
                      <span className="text-2xl">💵</span>
                      <div>
                        <p className="font-medium text-gray-800">Cash on Delivery</p>
                        <p className="text-sm text-gray-500">Pay when you receive</p>
                      </div>
                    </div>
                  </label>

                  {wallet && wallet.balance > 0 && (
                    <label
                      className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'wallet'
                          ? 'border-primary-600 bg-primary-50'
                          : wallet.balance < total
                          ? 'border-gray-200 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="payment"
                          value="wallet"
                          checked={paymentMethod === 'wallet'}
                          onChange={() => setPaymentMethod('wallet')}
                          disabled={wallet.balance < total}
                        />
                        <Wallet className="w-6 h-6 text-primary-600" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">Pay from Wallet</p>
                          <p className="text-sm text-gray-500">Balance: ₹{wallet.balance}</p>
                        </div>
                        {wallet.balance < total && (
                          <span className="text-xs text-red-500">Insufficient balance</span>
                        )}
                      </div>
                    </label>
                  )}

                  <label
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'online'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="payment"
                        value="online"
                        checked={paymentMethod === 'online'}
                        onChange={() => setPaymentMethod('online')}
                      />
                      <span className="text-2xl">💳</span>
                      <div>
                        <p className="font-medium text-gray-800">Pay Online</p>
                        <p className="text-sm text-gray-500">UPI, Cards, Net Banking</p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setCurrentStep('delivery')}
                    className="btn-outline"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep('review')}
                    className="flex-1 btn-primary"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
              <div className="space-y-6">
                {/* Order Items */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={item.product.images?.[0] || 'https://via.placeholder.com/100'}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{item.product.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.product.price}</p>
                        </div>
                        <p className="font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Delivery Address</h2>
                    <button
                      onClick={() => setCurrentStep('address')}
                      className="text-primary-600 text-sm font-medium"
                    >
                      Change
                    </button>
                  </div>
                  {addresses.find(a => a.id === selectedAddress) && (
                    <div className="text-gray-600">
                      <p className="font-medium text-gray-800">
                        {addresses.find(a => a.id === selectedAddress)?.name}
                      </p>
                      <p>{addresses.find(a => a.id === selectedAddress)?.addressLine1}</p>
                      <p>
                        {addresses.find(a => a.id === selectedAddress)?.city},{' '}
                        {addresses.find(a => a.id === selectedAddress)?.state} -{' '}
                        {addresses.find(a => a.id === selectedAddress)?.pincode}
                      </p>
                      <p className="mt-1">Phone: {addresses.find(a => a.id === selectedAddress)?.phone}</p>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Payment Method</h2>
                    <button
                      onClick={() => setCurrentStep('payment')}
                      className="text-primary-600 text-sm font-medium"
                    >
                      Change
                    </button>
                  </div>
                  <p className="text-gray-800">
                    {paymentMethod === 'cod' && '💵 Cash on Delivery'}
                    {paymentMethod === 'wallet' && '👛 Wallet Payment'}
                    {paymentMethod === 'online' && '💳 Online Payment'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentStep('payment')}
                    className="btn-outline"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Place Order • ₹${total.toFixed(2)}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              {/* Coupon Code */}
              <div className="mb-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-green-700 font-medium">{appliedCoupon}</span>
                    </div>
                    <button onClick={removeCoupon} className="text-gray-500 hover:text-gray-700">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon code"
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({items.length} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className={deliveryCharge === 0 ? 'text-green-600' : ''}>
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {subtotal < 499 && (
                <p className="mt-4 text-xs text-gray-500 text-center">
                  Add ₹{(499 - subtotal).toFixed(0)} more for FREE delivery
                </p>
              )}

              {/* Secure Checkout */}
              <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-sm">
                <span>🔒</span>
                <span>Secure checkout powered by SSL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddressForm(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add New Address</h3>
              <button onClick={() => setShowAddressForm(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Address Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                <div className="flex gap-3">
                  {['HOME', 'WORK', 'OTHER'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewAddress({ ...newAddress, type })}
                      className={`px-4 py-2 rounded-lg border ${
                        newAddress.type === type
                          ? 'border-primary-600 bg-primary-50 text-primary-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newAddress.name}
                  onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter full name"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  value={newAddress.addressLine1}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="House/Flat no., Building name"
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                <input
                  type="text"
                  value={newAddress.addressLine2}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Street, Area"
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="State"
                  />
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Pincode"
                />
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                <input
                  type="text"
                  value={newAddress.landmark}
                  onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Nearby landmark"
                />
              </div>

              <button
                onClick={handleSaveAddress}
                disabled={savingAddress}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {savingAddress ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Address'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
