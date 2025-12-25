import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch categories with product count
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
      take: 8,
    });

    // Fetch featured products
    const featuredProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        images: true,
        price: true,
        originalPrice: true,
        discount: true,
        unit: true,
        stockCount: true,
        rating: true,
        reviewCount: true,
        isOrganic: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });

    // Fetch bestseller products (highest reviewCount or orders)
    const bestsellerProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        reviewCount: { gt: 0 },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        images: true,
        price: true,
        originalPrice: true,
        discount: true,
        unit: true,
        stockCount: true,
        rating: true,
        reviewCount: true,
        isOrganic: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { reviewCount: 'desc' },
      take: 8,
    });

    // Fetch new arrivals
    const newArrivals = await prisma.product.findMany({
      where: {
        isActive: true,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        images: true,
        price: true,
        originalPrice: true,
        discount: true,
        unit: true,
        stockCount: true,
        rating: true,
        reviewCount: true,
        isOrganic: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });

    // Fetch discount products
    const discountProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        discount: { gt: 0 },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        images: true,
        price: true,
        originalPrice: true,
        discount: true,
        unit: true,
        stockCount: true,
        rating: true,
        reviewCount: true,
        isOrganic: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { discount: 'desc' },
      take: 8,
    });

    // Fetch active banners (if you have a Banner model, otherwise use static)
    // For now, using static banners
    const banners = [
      {
        id: '1',
        title: 'Fresh Fruits & Vegetables',
        subtitle: 'Get up to 30% off on all fresh produce',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&q=80',
        link: '/products?category=fruits',
        buttonText: 'Shop Now',
      },
      {
        id: '2',
        title: 'Organic Products',
        subtitle: 'Pure, Natural & Chemical-Free',
        image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1920&q=80',
        link: '/products?organic=true',
        buttonText: 'Explore',
      },
      {
        id: '3',
        title: 'Premium Dry Fruits',
        subtitle: 'Handpicked quality at best prices',
        image: 'https://images.unsplash.com/photo-1596591868231-05e908752cc1?w=1920&q=80',
        link: '/products?category=dry-fruits',
        buttonText: 'Buy Now',
      },
    ];

    // Transform products to match frontend format
    const transformProduct = (product: any) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      images: product.images,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      discount: product.discount || 0,
      unit: product.unit,
      stockStatus: product.stockCount > 10 ? 'in-stock' : product.stockCount > 0 ? 'limited' : 'out-of-stock',
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      isOrganic: product.isOrganic || false,
      isNewArrival: false,
      category: product.category,
    });

    return NextResponse.json({
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        productCount: cat._count.products,
      })),
      banners,
      featuredProducts: featuredProducts.map(transformProduct),
      bestsellerProducts: bestsellerProducts.map(transformProduct),
      newArrivals: newArrivals.map(p => ({ ...transformProduct(p), isNewArrival: true })),
      discountProducts: discountProducts.map(transformProduct),
    });
  } catch (error) {
    console.error('Homepage data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch homepage data' },
      { status: 500 }
    );
  }
}
