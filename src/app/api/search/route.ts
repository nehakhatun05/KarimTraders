import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Search products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!query || query.length < 2) {
      return NextResponse.json({ products: [], categories: [], suggestions: [] });
    }
    
    // Search products
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { has: query.toLowerCase() } },
          { category: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        images: { take: 1 },
        category: {
          select: { name: true, slug: true },
        },
      },
      take: limit,
      orderBy: [
        { featured: 'desc' },
        { rating: 'desc' },
      ],
    });
    
    // Get category matches with product counts
    const categories = await prisma.category.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      select: { 
        id: true, 
        name: true, 
        slug: true, 
        image: true,
        _count: {
          select: { products: true }
        }
      },
      take: 5,
    });
    
    // Generate search suggestions
    const suggestions = [
      ...categories.map((c: any) => ({ type: 'category' as const, name: c.name, slug: c.slug })),
      ...products.slice(0, 5).map((p: any) => ({ type: 'product' as const, name: p.name, slug: p.slug })),
    ];
    
    // Format products for response
    const formattedProducts = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      originalPrice: p.originalPrice,
      discount: p.discount,
      image: p.images[0]?.url || null,
      category: p.category?.name || null,
      categorySlug: p.category?.slug || null,
      stockStatus: p.stockStatus,
    }));
    
    // Format categories for response
    const formattedCategories = categories.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image,
      productCount: c._count.products,
    }));
    
    return NextResponse.json({
      products: formattedProducts,
      categories: formattedCategories,
      suggestions,
      total: products.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
