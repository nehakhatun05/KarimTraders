import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

async function isAdmin(session: any) {
  return session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
}

// Get all coupons
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!await isAdmin(session)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // active, expired, all
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const now = new Date();
    if (status === 'active') {
      where.isActive = true;
      where.validUntil = { gte: now };
      where.validFrom = { lte: now };
    } else if (status === 'expired') {
      where.OR = [
        { validUntil: { lt: now } },
        { isActive: false },
      ];
    }
    
    const coupons = await prisma.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });
    
    // Add computed status
    const couponsWithStatus = coupons.map((coupon: any) => ({
      ...coupon,
      status: !coupon.isActive 
        ? 'inactive' 
        : new Date(coupon.validUntil) < now 
          ? 'expired' 
          : new Date(coupon.validFrom) > now 
            ? 'scheduled' 
            : 'active',
      usageRemaining: coupon.usageLimit ? coupon.usageLimit - coupon.usedCount : null,
    }));
    
    return NextResponse.json({ coupons: couponsWithStatus });
  } catch (error) {
    console.error('Admin coupons fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

// Create new coupon
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!await isAdmin(session)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const {
      code,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      perUserLimit,
      validFrom,
      validUntil,
      isActive,
    } = body;
    
    // Validation
    if (!code || !type || value === undefined || !validFrom || !validUntil) {
      return NextResponse.json(
        { error: 'Code, type, value, validFrom, and validUntil are required' },
        { status: 400 }
      );
    }
    
    // Check for existing code
    const existing = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 400 }
      );
    }
    
    // Validate type
    if (!['PERCENTAGE', 'FIXED', 'FREE_DELIVERY'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid coupon type' },
        { status: 400 }
      );
    }
    
    // Validate percentage
    if (type === 'PERCENTAGE' && (value < 0 || value > 100)) {
      return NextResponse.json(
        { error: 'Percentage must be between 0 and 100' },
        { status: 400 }
      );
    }
    
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description,
        type,
        value: parseFloat(value),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        perUserLimit: perUserLimit ? parseInt(perUserLimit) : 1,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        isActive: isActive ?? true,
      },
    });
    
    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error('Coupon creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}
