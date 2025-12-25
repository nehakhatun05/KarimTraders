import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get active banners
export async function GET(request: NextRequest) {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    
    return NextResponse.json(banners);
  } catch (error) {
    console.error('Banners fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}
