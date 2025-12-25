'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <ChevronRight size={16} />
            <span className="text-gray-800">Privacy Policy</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Privacy Policy</h1>
          <p className="text-gray-500 text-sm mt-1">Last updated: December 2024</p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8">
          <div className="prose prose-gray max-w-none">
            <h2>1. Introduction</h2>
            <p>
              At KARIM TRADERS, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and mobile application.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>Personal Information</h3>
            <p>We may collect personal information that you provide to us, including:</p>
            <ul>
              <li>Name and contact information (email, phone number, address)</li>
              <li>Account credentials</li>
              <li>Payment information</li>
              <li>Delivery preferences</li>
              <li>Order history</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <p>When you use our Platform, we automatically collect:</p>
            <ul>
              <li>Device information (type, operating system, browser)</li>
              <li>IP address and location data</li>
              <li>Usage data (pages visited, time spent, interactions)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about orders, promotions, and updates</li>
              <li>Personalize your shopping experience</li>
              <li>Improve our products and services</li>
              <li>Detect and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>4. Information Sharing</h2>
            <p>We may share your information with:</p>
            <ul>
              <li><strong>Service Providers:</strong> Delivery partners, payment processors, and other vendors who help us operate</li>
              <li><strong>Business Partners:</strong> For joint marketing initiatives (with your consent)</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information, including:
            </p>
            <ul>
              <li>Encryption of sensitive data</li>
              <li>Secure payment processing</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication</li>
            </ul>

            <h2>6. Cookies</h2>
            <p>
              We use cookies and similar technologies to enhance your experience. You can control cookie preferences through your browser settings. Types of cookies we use:
            </p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for basic functionality</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how you use our Platform</li>
              <li><strong>Marketing Cookies:</strong> Used for personalized advertising</li>
            </ul>

            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability</li>
            </ul>

            <h2>8. Children's Privacy</h2>
            <p>
              Our Platform is not intended for children under 18 years of age. We do not knowingly collect personal information from children.
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us:
            </p>
            <ul>
              <li>Email: privacy@karimtraders.com</li>
              <li>Phone: +91 98765 43210</li>
              <li>Address: 123, Commercial Complex, MG Road, Bangalore - 560001</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
