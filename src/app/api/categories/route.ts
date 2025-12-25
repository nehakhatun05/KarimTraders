import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get('includeProducts') === 'true';
    const productLimit = parseInt(searchParams.get('productLimit') || '4');

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { products: true },
        },
        ...(includeProducts && {
          products: {
            where: { isActive: true },
            take: productLimit,
            orderBy: { createdAt: 'desc' },
            include: {
              images: { take: 1, orderBy: { sortOrder: 'asc' } },
            },
          },
        }),
      },
    });
    
    // Transform to include product count
    const categoriesWithCount = categories.map((cat: any) => ({
      ...cat,
      productCount: cat._count.products,
    }));
    
    return NextResponse.json({ categories: categoriesWithCount });
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
        description: body.description,
        icon: body.icon,
        image: body.image,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder || 0,
        parentId: body.parentId,
      },
    });
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Category creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
