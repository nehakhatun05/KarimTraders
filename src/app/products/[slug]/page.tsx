import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ProductDetailClient from './ProductDetailClient';
import { notFound } from 'next/navigation';

// Generate static params for popular products (optional - for static generation)
export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true },
      take: 50, // Pre-generate top 50 products
    });
    return products.map((product) => ({
      slug: product.slug,
    }));
  } catch {
    return [];
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: params.slug, isActive: true },
      include: {
        category: {
          select: { name: true, slug: true },
        },
        images: {
          select: { url: true },
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
    });

    if (!product) {
      return {
        title: 'Product Not Found | KARIM TRADERS',
        description: 'The product you are looking for does not exist.',
      };
    }

    const title = `${product.name} - Buy Online | KARIM TRADERS`;
    const description = product.description?.slice(0, 160) || 
      `Buy ${product.name} online at KARIM TRADERS. Fresh quality ${product.category?.name || 'groceries'} at best prices with fast delivery.`;

    const imageUrl = product.images?.[0]?.url;
    const ogImages = imageUrl 
      ? [{ url: imageUrl, alt: product.name, width: 800, height: 800 }]
      : [];

    return {
      title,
      description,
      keywords: [
        product.name,
        product.category?.name || 'groceries',
        'buy online',
        'fresh',
        'KARIM TRADERS',
        ...(product.isOrganic ? ['organic'] : []),
      ].join(', '),
      openGraph: {
        title,
        description,
        type: 'website',
        url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
        images: ogImages,
        siteName: 'KARIM TRADERS',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
      },
    };
  } catch {
    return {
      title: 'Product | KARIM TRADERS',
      description: 'Shop fresh groceries online at KARIM TRADERS.',
    };
  }
}

// Server component that fetches data and renders client component
export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  let product: any = null;
  let relatedProducts: any[] = [];

  try {
    product = await prisma.product.findFirst({
      where: { slug: params.slug, isActive: true },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        nutrition: true,
        reviews: {
          where: { isVerified: true },
          include: {
            user: {
              select: { name: true, image: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (product) {
      relatedProducts = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          isActive: true,
          id: { not: product.id },
        },
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          category: {
            select: { name: true, slug: true },
          },
        },
        take: 4,
      });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
  }

  if (!product) {
    notFound();
  }

  // Extract image URLs from ProductImage relation
  const imageUrls = product.images?.map((img: any) => img.url) || [];

  // Transform to match client component expectations
  const transformedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    shortDescription: product.shortDescription || '',
    images: imageUrls,
    price: product.price,
    originalPrice: product.originalPrice || product.price,
    discount: product.discount || 0,
    unit: product.unit,
    stock: product.stockCount,
    stockStatus: product.stockCount > 10 ? 'in-stock' : product.stockCount > 0 ? 'limited' : 'out-of-stock',
    rating: product.rating || 0,
    reviewCount: product.reviewCount || 0,
    isOrganic: product.isOrganic || false,
    nutritionInfo: product.nutrition || null,
    category: product.category,
  };

  const transformedRelated = relatedProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    images: p.images?.map((img: any) => img.url) || [],
    price: p.price,
    originalPrice: p.originalPrice || p.price,
    discount: p.discount || 0,
    unit: p.unit,
    stockStatus: p.stockCount > 10 ? 'in-stock' : p.stockCount > 0 ? 'limited' : 'out-of-stock',
    rating: p.rating || 0,
    reviewCount: p.reviewCount || 0,
    isOrganic: p.isOrganic || false,
    category: p.category,
  }));

  const transformedReviews = product.reviews?.map((r: any) => ({
    id: r.id,
    rating: r.rating,
    title: r.title || '',
    comment: r.comment || '',
    userName: r.user?.name || 'Anonymous',
    userImage: r.user?.image,
    createdAt: r.createdAt.toISOString(),
    isVerifiedPurchase: r.isVerified || false,
  })) || [];

  // JSON-LD structured data for the product
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: imageUrls,
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: 'KARIM TRADERS',
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.stockCount > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'KARIM TRADERS',
      },
    },
    aggregateRating: product.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={transformedProduct}
        relatedProducts={transformedRelated}
        reviews={transformedReviews}
      />
    </>
  );
}
