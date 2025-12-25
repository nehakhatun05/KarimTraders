'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <ChevronRight size={16} />
            <span className="text-gray-800">Terms & Conditions</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Terms & Conditions</h1>
          <p className="text-gray-500 text-sm mt-1">Last updated: December 2024</p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8">
          <div className="prose prose-gray max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Welcome to KARIM TRADERS. These Terms and Conditions govern your use of our website and services. By accessing or using our platform, you agree to be bound by these terms.
            </p>

            <h2>2. Definitions</h2>
            <ul>
              <li><strong>"Platform"</strong> refers to the KARIM TRADERS website and mobile application</li>
              <li><strong>"User"</strong> refers to any person who accesses or uses the Platform</li>
              <li><strong>"Products"</strong> refers to goods available for purchase on the Platform</li>
              <li><strong>"Services"</strong> refers to delivery and other services provided by us</li>
            </ul>

            <h2>3. Account Registration</h2>
            <p>
              To use certain features of our Platform, you may need to register for an account. You agree to:
            </p>
            <ul>
              <li>Provide accurate and complete information during registration</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access to your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>

            <h2>4. Orders and Payments</h2>
            <p>
              When you place an order through our Platform:
            </p>
            <ul>
              <li>All prices are in Indian Rupees (INR) and include applicable taxes</li>
              <li>We reserve the right to refuse or cancel any order for any reason</li>
              <li>Payment must be made through approved payment methods</li>
              <li>Orders are subject to availability and delivery area restrictions</li>
            </ul>

            <h2>5. Delivery</h2>
            <p>
              We strive to deliver your orders on time. However:
            </p>
            <ul>
              <li>Delivery times are estimates and not guaranteed</li>
              <li>We are not liable for delays caused by factors beyond our control</li>
              <li>You must provide accurate delivery information</li>
              <li>Someone must be available to receive the delivery</li>
            </ul>

            <h2>6. Returns and Refunds</h2>
            <p>
              Our return and refund policy allows you to:
            </p>
            <ul>
              <li>Return products within 24 hours of delivery if quality is unsatisfactory</li>
              <li>Report issues with perishable items within 2 hours of delivery</li>
              <li>Receive refunds to original payment method or wallet</li>
            </ul>

            <h2>7. Prohibited Activities</h2>
            <p>
              Users are prohibited from:
            </p>
            <ul>
              <li>Using the Platform for any illegal purpose</li>
              <li>Attempting to gain unauthorized access to our systems</li>
              <li>Interfering with the proper functioning of the Platform</li>
              <li>Posting false, misleading, or harmful content</li>
            </ul>

            <h2>8. Intellectual Property</h2>
            <p>
              All content on this Platform, including logos, text, images, and software, is the property of KARIM TRADERS and is protected by intellectual property laws.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              KARIM TRADERS shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Platform.
            </p>

            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the Platform after changes constitutes acceptance of the modified terms.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <ul>
              <li>Email: legal@karimtraders.com</li>
              <li>Phone: +91 98765 43210</li>
              <li>Address: 123, Commercial Complex, MG Road, Bangalore - 560001</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
