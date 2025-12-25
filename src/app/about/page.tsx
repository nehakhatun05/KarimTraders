'use client';

import Link from 'next/link';
import { 
  ChevronRight, 
  Target, 
  Eye, 
  Heart, 
  Users, 
  Truck, 
  Award,
  Leaf,
  Shield,
  Clock
} from 'lucide-react';

const stats = [
  { label: 'Happy Customers', value: '50K+', icon: Users },
  { label: 'Products', value: '1000+', icon: Award },
  { label: 'Cities Served', value: '25+', icon: Truck },
  { label: 'Years of Trust', value: '10+', icon: Shield },
];

const values = [
  {
    icon: Leaf,
    title: 'Freshness First',
    description: 'We source directly from farms to ensure you get the freshest produce every single time.',
  },
  {
    icon: Heart,
    title: 'Customer Love',
    description: 'Your satisfaction is our priority. We go above and beyond to make you happy.',
  },
  {
    icon: Shield,
    title: 'Quality Assured',
    description: 'Every product goes through rigorous quality checks before reaching you.',
  },
  {
    icon: Clock,
    title: 'Always On Time',
    description: 'We value your time. Expect your deliveries right when you need them.',
  },
];

const team = [
  { name: 'Karim Ahmed', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
  { name: 'Priya Sharma', role: 'Operations Head', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
  { name: 'Rahul Verma', role: 'Tech Lead', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' },
  { name: 'Anjali Patel', role: 'Customer Success', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200' },
];

const milestones = [
  { year: '2014', event: 'KARIM TRADERS founded with a small store in Bangalore' },
  { year: '2016', event: 'Launched online ordering platform' },
  { year: '2018', event: 'Expanded to 5 major cities' },
  { year: '2020', event: 'Served 1 million+ orders during pandemic' },
  { year: '2022', event: 'Launched mobile app with 100K+ downloads' },
  { year: '2024', event: 'Now serving 25+ cities with 1000+ products' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="container-custom">
          <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={16} />
            <span className="text-white">About Us</span>
          </div>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About KARIM TRADERS</h1>
            <p className="text-xl text-white/90">
              Your trusted partner for fresh groceries, delivering quality and convenience to your doorstep since 2014.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container-custom -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center">
                <Icon className="text-primary-600 mx-auto mb-2" size={32} />
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Our Story */}
      <div className="container-custom py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                KARIM TRADERS was born out of a simple belief – everyone deserves access to fresh, quality groceries at fair prices. What started as a small neighborhood store in Bangalore in 2014 has grown into one of the most trusted online grocery platforms in India.
              </p>
              <p>
                Our founder, Karim Ahmed, noticed how difficult it was for busy families to find time to shop for fresh produce. The local markets were often crowded, and the quality was inconsistent. He envisioned a service that would bring the freshest fruits, vegetables, dry fruits, and spices directly to people's homes.
              </p>
              <p>
                Today, we source directly from over 500 farmers and trusted suppliers, ensuring that every product meets our strict quality standards. Our state-of-the-art cold chain infrastructure ensures that what reaches your doorstep is as fresh as the day it was harvested.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600"
                alt="Fresh groceries"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-6">
              <p className="text-4xl font-bold text-primary-600">10+</p>
              <p className="text-gray-600">Years of Excellence</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="bg-white py-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8">
              <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mb-4">
                <Target className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To make fresh, quality groceries accessible to every household in India through technology-driven convenience, transparent pricing, and uncompromising commitment to customer satisfaction.
              </p>
            </div>
            <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-2xl p-8">
              <div className="w-14 h-14 bg-secondary-600 rounded-xl flex items-center justify-center mb-4">
                <Eye className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To become India's most loved and trusted grocery platform, known for quality, reliability, and innovation. We aim to transform how India shops for groceries while supporting local farmers and sustainable practices.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="container-custom py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Core Values</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            These values guide everything we do at KARIM TRADERS
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="text-primary-600" size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-100 py-16">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Our Journey</h2>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary-200 transform md:-translate-x-1/2" />
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`relative flex items-center gap-4 mb-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} pl-12 md:pl-0`}>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                      <p className="text-primary-600 font-bold text-lg">{milestone.year}</p>
                      <p className="text-gray-600">{milestone.event}</p>
                    </div>
                  </div>
                  <div className="absolute left-4 md:static w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center z-10 md:mx-4">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="container-custom py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Meet Our Leadership</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The passionate team behind KARIM TRADERS
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden group">
              <div className="aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-800">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
        <div className="container-custom text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience the KARIM Difference?</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers who trust us for their daily grocery needs
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/products" className="px-8 py-3 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Start Shopping
            </Link>
            <Link href="/contact" className="px-8 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
