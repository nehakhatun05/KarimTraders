import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;
    
    // Filters
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const isOrganic = searchParams.get('organic') === 'true';
    const isFeatured = searchParams.get('featured') === 'true';
    const isBestSeller = searchParams.get('bestseller') === 'true';
    const inStock = searchParams.get('inStock') === 'true';
    const rating = searchParams.get('rating');
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build where clause
    const where: any = {
      isActive: true,
    };
    
    if (category) {
      where.category = { slug: category };
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ];
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    
    if (isOrganic) where.isOrganic = true;
    if (isFeatured) where.isFeatured = true;
    if (isBestSeller) where.isBestSeller = true;
    if (inStock) where.stockStatus = 'IN_STOCK';
    
    // Build order by
    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'discount') {
      orderBy.discount = 'desc';
    } else {
      orderBy.createdAt = sortOrder;
    }
    
    // Get products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          _count: {
            select: { reviews: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);
    
    // Calculate average rating for each product
    const productsWithRating = await Promise.all(
      products.map(async (product: any) => {
        const avgRating = await prisma.review.aggregate({
          where: { productId: product.id },
          _avg: { rating: true },
        });
        
        return {
          ...product,
          averageRating: avgRating._avg.rating || 0,
          reviewCount: product._count.reviews,
        };
      })
    );
    
    return NextResponse.json({
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }
    
    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    // Generate SKU if not provided
    const sku = body.sku || `KT-${Date.now()}`;
    
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
        description: body.description,
        shortDescription: body.shortDescription,
        price: body.price,
        originalPrice: body.originalPrice,
        discount: body.discount || 0,
        unit: body.unit || '1 kg',
        sku,
        barcode: body.barcode,
        stockCount: body.stockCount || 0,
        stockStatus: body.stockStatus || 'IN_STOCK',
        isActive: body.isActive ?? true,
        isFeatured: body.isFeatured || false,
        isBestSeller: body.isBestSeller || false,
        isOrganic: body.isOrganic || false,
        isNew: body.isNew || false,
        categoryId: body.categoryId,
        tags: body.tags || [],
        images: {
          create: body.images?.map((img: any, index: number) => ({
            url: img.url,
            alt: img.alt || body.name,
            sortOrder: index,
          })) || [],
        },
        nutrition: body.nutrition ? {
          create: body.nutrition,
        } : undefined,
      },
      include: {
        category: true,
        images: true,
        nutrition: true,
      },
    });
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
