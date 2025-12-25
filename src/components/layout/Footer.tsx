import Link from 'next/link';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  CreditCard,
  Truck,
  Shield,
  Headphones
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Features Bar */}
      <div className="border-b border-gray-800">
        <div className="container-custom py-6 sm:py-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="text-primary-500" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm sm:text-base">Free Delivery</h4>
                <p className="text-xs sm:text-sm text-gray-400">Orders above ₹500</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="text-primary-500" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm sm:text-base">Secure Payment</h4>
                <p className="text-xs sm:text-sm text-gray-400">100% secure</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                <CreditCard className="text-primary-500" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm sm:text-base">Easy Returns</h4>
                <p className="text-xs sm:text-sm text-gray-400">Hassle-free</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Headphones className="text-primary-500" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm sm:text-base">24/7 Support</h4>
                <p className="text-xs sm:text-sm text-gray-400">Dedicated support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">K</span>
              </div>
              <div>
                <h1 className="font-display font-bold text-lg sm:text-xl text-white">KARIM</h1>
                <p className="text-[10px] sm:text-xs text-primary-500 -mt-1 font-medium">TRADERS</p>
              </div>
            </Link>
            <p className="text-gray-400 mb-4 sm:mb-6 max-w-md text-sm sm:text-base">
              Your trusted online grocery store for fresh fruits, vegetables, dry fruits, and authentic Indian spices. 
              Quality products delivered to your doorstep.
            </p>
            <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <div className="flex items-center gap-2 sm:gap-3">
                <MapPin size={16} className="text-primary-500 flex-shrink-0" />
                <span>123, Market Street, Mumbai - 400001</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Phone size={16} className="text-primary-500 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Mail size={16} className="text-primary-500 flex-shrink-0" />
                <span className="truncate">support@karimtraders.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white text-base sm:text-lg mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <li>
                <Link href="/about" className="hover:text-primary-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-500 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-primary-500 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary-500 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/stores" className="hover:text-primary-500 transition-colors">
                  Store Locator
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-white text-base sm:text-lg mb-3 sm:mb-4">Customer Service</h3>
            <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <li>
                <Link href="/help" className="hover:text-primary-500 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-primary-500 transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-primary-500 transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-primary-500 transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary-500 transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies - Hidden on very small screens, shown on md+ */}
          <div className="hidden md:block">
            <h3 className="font-semibold text-white text-base sm:text-lg mb-3 sm:mb-4">Policies</h3>
            <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <li>
                <Link href="/privacy" className="hover:text-primary-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary-500 transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-primary-500 transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-primary-500 transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6 sm:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-white text-base sm:text-lg mb-1">Subscribe to our Newsletter</h3>
              <p className="text-gray-400 text-sm sm:text-base">Get updates on offers, new products, and more!</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-80 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm sm:text-base"
              />
              <button className="btn-primary whitespace-nowrap text-sm sm:text-base px-3 sm:px-4">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-4 sm:py-6">
          <div className="flex flex-col items-center gap-4">
            {/* Social Links */}
            <div className="flex items-center gap-3 sm:gap-4">
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors">
                <Youtube size={16} />
              </a>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="text-gray-500 text-xs sm:text-sm">We accept:</span>
              <div className="flex gap-1.5 sm:gap-2">
                <div className="bg-white rounded px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-gray-800">VISA</div>
                <div className="bg-white rounded px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-gray-800">MC</div>
                <div className="bg-white rounded px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-gray-800">UPI</div>
                <div className="bg-white rounded px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-gray-800">COD</div>
              </div>
            </div>

            <p className="text-gray-400 text-xs sm:text-sm text-center">
              © 2024 Karim Traders. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
