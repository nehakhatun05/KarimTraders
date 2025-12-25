'use client';

import { Shield, Truck, Clock, RefreshCw, Award, Headphones, Leaf, CreditCard } from 'lucide-react';

const trustFeatures = [
  {
    icon: <Truck size={28} />,
    title: 'Express Delivery',
    description: 'Get your groceries delivered in just 10-30 minutes',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: <Shield size={28} />,
    title: '100% Quality Assured',
    description: 'All products are quality checked before delivery',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: <RefreshCw size={28} />,
    title: 'Easy Returns',
    description: 'Not satisfied? Get instant refund or replacement',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: <CreditCard size={28} />,
    title: 'Secure Payments',
    description: 'Multiple payment options with 100% secure checkout',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

const qualityPromises = [
  { icon: <Leaf size={20} />, text: 'Farm Fresh Products' },
  { icon: <Award size={20} />, text: 'Top Quality Brands' },
  { icon: <Clock size={20} />, text: 'Same Day Delivery' },
  { icon: <Headphones size={20} />, text: '24/7 Support' },
];

export default function TrustBadges() {
  return (
    <section className="py-12 bg-white">
      <div className="container-custom">
        {/* Trust Features Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {trustFeatures.map((feature, index) => (
            <div
              key={index}
              className="group p-4 sm:p-6 rounded-2xl bg-white border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${feature.color} group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 sm:mb-2">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Quality Promise Strip */}
        <div className="bg-gradient-to-r from-primary-50 to-green-50 rounded-2xl p-4 sm:p-6">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            {qualityPromises.map((promise, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 text-primary-700"
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                  {promise.icon}
                </div>
                <span className="text-sm font-medium">{promise.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
