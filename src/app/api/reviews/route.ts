import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().min(2).max(100).optional(),
  comment: z.string().min(10).max(1000).optional(),
  images: z.array(z.string().url()).max(5).optional(),
});

// Get reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'recent';
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      );
    }
    
    let orderBy: any = { createdAt: 'desc' };
    
    if (sortBy === 'rating-high') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'rating-low') {
      orderBy = { rating: 'asc' };
    } else if (sortBy === 'helpful') {
      orderBy = { helpfulCount: 'desc' };
    }
    
    const [reviews, total, ratingStats] = await Promise.all([
      prisma.review.findMany({
        where: { productId, isVerified: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({
        where: { productId, isVerified: true },
      }),
      prisma.review.groupBy({
        by: ['rating'],
        where: { productId, isVerified: true },
        _count: true,
      }),
    ]);
    
    // Calculate rating distribution
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingStats.forEach((stat: { rating: number; _count: number }) => {
      distribution[stat.rating as keyof typeof distribution] = stat._count;
    });
    
    const avgRating = total > 0
      ? Object.entries(distribution).reduce((sum: number, [rating, count]: [string, number]) => 
          sum + (parseInt(rating) * count), 0) / total
      : 0;
    
    return NextResponse.json({
      reviews,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: total,
      distribution,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// Submit a review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const validation = reviewSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { productId, rating, title, comment, images } = validation.data;
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check if user has ordered this product
    const hasOrdered = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.user.id,
          status: 'DELIVERED',
        },
      },
    });
    
    // Check if already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });
    
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }
    
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId,
        rating,
        title: title || null,
        comment: comment || null,
        images: images || [],
        isVerified: !!hasOrdered, // Mark as verified if user purchased
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    // Update product rating
    const avgRating = await prisma.review.aggregate({
      where: { productId, isVerified: true },
      _avg: { rating: true },
      _count: true,
    });
    
    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: avgRating._avg.rating || 0,
        reviewCount: avgRating._count,
      },
    });
    
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

// Mark review as helpful
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { reviewId } = body;
    
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount: { increment: 1 } },
    });
    
    return NextResponse.json({ helpfulCount: review.helpfulCount });
  } catch (error) {
    console.error('Mark helpful error:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}
