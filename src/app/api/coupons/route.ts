import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Validate coupon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;
    
    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code required' },
        { status: 400 }
      );
    }
    
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        validFrom: { lte: new Date() },
        validUntil: { gte: new Date() },
      },
    });
    
    if (!coupon) {
      return NextResponse.json(
        { error: 'Invalid or expired coupon' },
        { status: 400 }
      );
    }
    
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: 'Coupon usage limit exceeded' },
        { status: 400 }
      );
    }
    
    if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
      return NextResponse.json(
        { error: `Minimum order amount is ₹${coupon.minOrderAmount}` },
        { status: 400 }
      );
    }
    
    let discount = 0;
    
    if (coupon.type === 'PERCENTAGE') {
      discount = (subtotal * Number(coupon.value)) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    } else {
      discount = Number(coupon.value);
    }
    
    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description,
      },
      discount: Math.round(discount * 100) / 100,
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}

// Get available coupons
export async function GET(request: NextRequest) {
  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        validFrom: { lte: new Date() },
        validUntil: { gte: new Date() },
      },
      select: {
        code: true,
        type: true,
        value: true,
        description: true,
        minOrderAmount: true,
        maxDiscount: true,
        validUntil: true,
      },
      orderBy: { validUntil: 'asc' },
    });
    
    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Coupons fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}
