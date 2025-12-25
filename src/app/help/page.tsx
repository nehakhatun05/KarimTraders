'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  ChevronDown,
  Search,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  HelpCircle,
  Package,
  Truck,
  CreditCard,
  RotateCcw,
  ShieldCheck,
  User
} from 'lucide-react';

const faqCategories = [
  {
    id: 'orders',
    icon: Package,
    title: 'Orders & Delivery',
    faqs: [
      {
        q: 'How can I track my order?',
        a: 'You can track your order by going to My Account > Orders and clicking on the specific order. You\'ll see real-time tracking information including the current status and expected delivery time.'
      },
      {
        q: 'What are the delivery charges?',
        a: 'Delivery is FREE on orders above ₹499. For orders below ₹499, a nominal delivery charge of ₹29 is applied. Express delivery is available at an additional charge of ₹49.'
      },
      {
        q: 'What are your delivery timings?',
        a: 'We deliver from 7 AM to 10 PM, 7 days a week. You can choose your preferred delivery slot during checkout. Same-day delivery is available for orders placed before 2 PM.'
      },
      {
        q: 'Can I change my delivery address after placing an order?',
        a: 'Yes, you can change the delivery address before the order is dispatched. Go to My Orders, select the order, and click on "Change Address". Once dispatched, the address cannot be changed.'
      },
    ]
  },
  {
    id: 'payments',
    icon: CreditCard,
    title: 'Payments & Pricing',
    faqs: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept Credit/Debit Cards (Visa, MasterCard, RuPay), UPI (GPay, PhonePe, Paytm), Net Banking, and Cash on Delivery. You can also use KARIM Wallet for instant payments.'
      },
      {
        q: 'Is Cash on Delivery available?',
        a: 'Yes, Cash on Delivery is available for orders up to ₹5,000. A small COD charge of ₹19 may apply on certain orders.'
      },
      {
        q: 'How do I apply a coupon code?',
        a: 'During checkout, you\'ll see an "Apply Coupon" field. Enter your coupon code and click Apply. The discount will be reflected in your order total.'
      },
      {
        q: 'Why was my payment declined?',
        a: 'Payments can be declined due to insufficient funds, incorrect card details, or bank restrictions. Please check your card details and try again, or use an alternative payment method.'
      },
    ]
  },
  {
    id: 'returns',
    icon: RotateCcw,
    title: 'Returns & Refunds',
    faqs: [
      {
        q: 'What is your return policy?',
        a: 'We have a hassle-free return policy. If you\'re not satisfied with the quality of any product, you can raise a return request within 24 hours of delivery. Perishable items must be reported within 2 hours.'
      },
      {
        q: 'How long does it take to get a refund?',
        a: 'Refunds are processed within 2-3 business days after we receive and verify the returned item. The amount will be credited to your original payment method or KARIM Wallet, as per your preference.'
      },
      {
        q: 'Can I exchange a product?',
        a: 'Yes, you can exchange products of the same value. If the replacement is not available, we\'ll process a full refund.'
      },
    ]
  },
  {
    id: 'account',
    icon: User,
    title: 'Account & Profile',
    faqs: [
      {
        q: 'How do I create an account?',
        a: 'Click on Sign Up at the top of the page. You can register using your email address or phone number. You\'ll receive a verification code to complete the registration.'
      },
      {
        q: 'I forgot my password. How can I reset it?',
        a: 'Click on "Forgot Password" on the login page. Enter your registered email/phone number and we\'ll send you a reset link/OTP.'
      },
      {
        q: 'How do I update my profile information?',
        a: 'Go to My Account > Profile. You can update your name, email, phone number, and profile picture. Some changes may require verification.'
      },
    ]
  },
  {
    id: 'quality',
    icon: ShieldCheck,
    title: 'Quality & Freshness',
    faqs: [
      {
        q: 'How do you ensure product freshness?',
        a: 'We source directly from farms and trusted suppliers. All products go through a 3-stage quality check. Our temperature-controlled storage and delivery ensures freshness till your doorstep.'
      },
      {
        q: 'What if I receive a damaged or poor quality product?',
        a: 'We apologize for any inconvenience. Please raise a complaint within 24 hours with photos of the product. We\'ll arrange for a replacement or full refund immediately.'
      },
      {
        q: 'Are organic products really organic?',
        a: 'Yes, all our organic products are certified by recognized authorities. You can check the certification details on each product page.'
      },
    ]
  },
];

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState('orders');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = searchQuery
    ? faqCategories.flatMap(cat => 
        cat.faqs.filter(faq => 
          faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.a.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(faq => ({ ...faq, category: cat.title }))
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
        <div className="container-custom text-center">
          <HelpCircle size={48} className="mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">How can we help you?</h1>
          
          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Search Results */}
        {searchQuery && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Search Results ({filteredFaqs.length})
            </h2>
            {filteredFaqs.length > 0 ? (
              <div className="space-y-3">
                {filteredFaqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm p-4">
                    <p className="text-xs text-primary-600 mb-1">{faq.category}</p>
                    <p className="font-medium text-gray-800 mb-2">{faq.q}</p>
                    <p className="text-sm text-gray-600">{faq.a}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No results found. Try different keywords.</p>
            )}
          </div>
        )}

        {/* Quick Contact */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <a href="tel:+919876543210" className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Phone className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Call Us</p>
              <p className="text-sm text-gray-500">+91 98765 43210</p>
            </div>
          </a>
          <a href="mailto:support@karimtraders.com" className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
              <Mail className="text-secondary-600" size={24} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Email Us</p>
              <p className="text-sm text-gray-500">support@karimtraders.com</p>
            </div>
          </a>
          <button className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow text-left">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <MessageCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Live Chat</p>
              <p className="text-sm text-gray-500">Available 24/7</p>
            </div>
          </button>
        </div>

        {/* FAQ Section */}
        {!searchQuery && (
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Category Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
                <h3 className="font-semibold text-gray-800 mb-4">Categories</h3>
                <nav className="space-y-1">
                  {faqCategories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          activeCategory === cat.id
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{cat.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* FAQs */}
            <div className="lg:col-span-3">
              {faqCategories
                .filter(cat => cat.id === activeCategory)
                .map((category) => (
                  <div key={category.id}>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">{category.title}</h2>
                    <div className="space-y-3">
                      {category.faqs.map((faq, index) => {
                        const faqId = `${category.id}-${index}`;
                        const isOpen = openFaq === faqId;
                        
                        return (
                          <div
                            key={faqId}
                            className="bg-white rounded-xl shadow-sm overflow-hidden"
                          >
                            <button
                              onClick={() => setOpenFaq(isOpen ? null : faqId)}
                              className="w-full flex items-center justify-between p-5 text-left"
                            >
                              <span className="font-medium text-gray-800 pr-4">{faq.q}</span>
                              <ChevronDown
                                size={20}
                                className={`text-gray-400 flex-shrink-0 transition-transform ${
                                  isOpen ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                            {isOpen && (
                              <div className="px-5 pb-5">
                                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Still Need Help */}
        <div className="mt-12 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Still need help?</h2>
          <p className="text-gray-600 mb-6">Our support team is here for you 24/7</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-primary">
              Contact Us
            </Link>
            <button className="btn-outline">
              Start Live Chat
            </button>
          </div>
        </div>

        {/* Support Hours */}
        <div className="mt-8 flex items-center justify-center gap-2 text-gray-500">
          <Clock size={18} />
          <span>Support available 24 hours, 7 days a week</span>
        </div>
      </div>
    </div>
  );
}
