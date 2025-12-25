'use client';

import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 5,
    text: 'The quality of fruits and vegetables from Karim Traders is exceptional! I\'ve been ordering for 6 months now and never been disappointed. The delivery is always on time.',
  },
  {
    id: 2,
    name: 'Rahul Verma',
    location: 'Delhi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 5,
    text: 'Best dry fruits I\'ve ever had! The almonds and cashews are fresh and premium quality. Great packaging and fast delivery. Highly recommended!',
  },
  {
    id: 3,
    name: 'Anita Patel',
    location: 'Bangalore',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    rating: 5,
    text: 'The spices from Karim Traders have transformed my cooking! The Kashmiri red chilli and turmeric are authentic and so flavorful. Love the organic options!',
  },
  {
    id: 4,
    name: 'Mohammed Khan',
    location: 'Hyderabad',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    rating: 4,
    text: 'Great service and excellent product quality. The subscribe & save option is very convenient for regular grocery needs. Customer support is also very helpful.',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-primary-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">Trusted by thousands of happy customers</p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 text-primary-200">
                <Quote size={28} className="sm:w-10 sm:h-10" />
              </div>

              {/* Rating */}
              <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={`sm:w-[18px] sm:h-[18px] ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed line-clamp-4">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-2 sm:gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-9 h-9 sm:w-12 sm:h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-800 text-sm sm:text-base">{testimonial.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">50K+</p>
            <p className="text-gray-600">Happy Customers</p>
          </div>
          <div className="w-px h-12 bg-gray-300 hidden md:block" />
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">4.8/5</p>
            <p className="text-gray-600">Average Rating</p>
          </div>
          <div className="w-px h-12 bg-gray-300 hidden md:block" />
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">100%</p>
            <p className="text-gray-600">Fresh Products</p>
          </div>
          <div className="w-px h-12 bg-gray-300 hidden md:block" />
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">24/7</p>
            <p className="text-gray-600">Customer Support</p>
          </div>
        </div>
      </div>
    </section>
  );
}
