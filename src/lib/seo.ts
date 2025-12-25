import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://karimtraders.com';

// Default SEO configuration
export const defaultSEO: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'KARIM TRADERS - Fresh Groceries Online | Fruits, Vegetables, Dry Fruits & Spices',
    template: '%s | KARIM TRADERS',
  },
  description: 'Shop fresh fruits, vegetables, dry fruits, and authentic Indian spices online at KARIM TRADERS. Quality products, best prices, and fast delivery to your doorstep.',
  keywords: [
    'groceries online',
    'fresh fruits',
    'fresh vegetables',
    'dry fruits',
    'indian spices',
    'organic food',
    'online grocery shopping',
    'karim traders',
    'home delivery',
    'farm fresh',
  ],
  authors: [{ name: 'KARIM TRADERS' }],
  creator: 'KARIM TRADERS',
  publisher: 'KARIM TRADERS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: baseUrl,
    siteName: 'KARIM TRADERS',
    title: 'KARIM TRADERS - Fresh Groceries Online',
    description: 'Shop fresh fruits, vegetables, dry fruits, and spices online. Quality products delivered to your doorstep.',
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'KARIM TRADERS - Fresh Groceries Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KARIM TRADERS - Fresh Groceries Online',
    description: 'Shop fresh fruits, vegetables, dry fruits, and spices online.',
    images: [`${baseUrl}/og-image.jpg`],
    creator: '@karimtraders',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

// Generate product page metadata
export function generateProductMetadata(product: {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  images?: { url: string }[];
  category?: { name: string };
  rating?: number;
  reviewCount?: number;
}): Metadata {
  const title = `${product.name} - Buy Online at Best Price`;
  const description = product.shortDescription || product.description || 
    `Buy ${product.name} online at KARIM TRADERS. Fresh quality, best prices, fast delivery.`;
  const image = product.images?.[0]?.url || `${baseUrl}/og-image.jpg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${baseUrl}/products/${product.slug}`,
      images: [{ url: image, width: 800, height: 800, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

// Generate category page metadata
export function generateCategoryMetadata(category: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}): Metadata {
  const title = `${category.name} - Fresh ${category.name} Online`;
  const description = category.description || 
    `Shop fresh ${category.name.toLowerCase()} online at KARIM TRADERS. Best quality, competitive prices, fast delivery.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${baseUrl}/products?category=${category.slug}`,
      images: category.image ? [{ url: category.image, alt: category.name }] : undefined,
    },
  };
}

// JSON-LD structured data generators
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KARIM TRADERS',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Fresh groceries online - fruits, vegetables, dry fruits, and spices',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
      addressLocality: 'Mumbai',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-98765-43210',
      contactType: 'customer service',
      availableLanguage: ['English', 'Hindi'],
    },
    sameAs: [
      'https://facebook.com/karimtraders',
      'https://instagram.com/karimtraders',
      'https://twitter.com/karimtraders',
    ],
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'KARIM TRADERS',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateProductSchema(product: {
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  images?: { url: string }[];
  rating?: number;
  reviewCount?: number;
  stockStatus?: string;
  sku?: string;
  brand?: string;
  category?: { name: string };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.map(img => img.url) || [],
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'KARIM TRADERS',
    },
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/products/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.stockStatus === 'OUT_OF_STOCK' 
        ? 'https://schema.org/OutOfStock' 
        : 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'KARIM TRADERS',
      },
    },
    aggregateRating: product.reviewCount && product.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 0,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
