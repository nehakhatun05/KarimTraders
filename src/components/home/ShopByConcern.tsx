'use client';

import Link from 'next/link';
import { Leaf, MapPin, Calendar, Award } from 'lucide-react';

const features = [
  {
    icon: Leaf,
    title: 'Organic Products',
    description: 'Certified organic fruits and vegetables for a healthy lifestyle',
    link: '/products?organic=true',
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    icon: MapPin,
    title: 'Locally Sourced',
    description: 'Supporting local farmers with farm-fresh produce',
    link: '/products?local=true',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: Calendar,
    title: 'Seasonal Specials',
    description: 'Discover the best seasonal fruits and vegetables',
    link: '/products?seasonal=true',
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Hand-picked premium grade products only',
    link: '/products?premium=true',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
];

export default function ShopByConcern() {
  return (
    <section className="py-12">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="section-title">Shop by Concern</h2>
          <p className="section-subtitle">Find products that match your preferences</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={index}
                href={feature.link}
                className="group card p-3 sm:p-6 text-center hover:border-primary-200 border-2 border-transparent transition-all"
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={feature.iconColor} size={20} />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{feature.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
