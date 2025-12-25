import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { sendEmail, emailTemplates } from '@/lib/email';

const orderSchema = z.object({
  addressId: z.string(),
  paymentMethod: z.enum(['COD', 'ONLINE', 'WALLET']),
  deliverySlotId: z.string().optional(),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
});

// Get user's orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    
    const where: any = { userId: session.user.id };
    
    if (status) {
      where.status = status;
    }
    
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { take: 1 },
                },
              },
            },
          },
          address: true,
          deliverySlot: true,
          timeline: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);
    
    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// Create new order
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
    const validation = orderSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { addressId, paymentMethod, deliverySlotId, notes, couponCode } = validation.data;
    
    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true },
    });
    
    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }
    
    // Verify address
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: session.user.id,
      },
    });
    
    if (!address) {
      return NextResponse.json(
        { error: 'Invalid address' },
        { status: 400 }
      );
    }
    
    // Check product availability
    for (const item of cartItems) {
      if (item.product.stockStatus === 'OUT_OF_STOCK') {
        return NextResponse.json(
          { error: `${item.product.name} is out of stock` },
          { status: 400 }
        );
      }
      if (item.quantity > item.product.stockCount) {
        return NextResponse.json(
          { error: `Only ${item.product.stockCount} units of ${item.product.name} available` },
          { status: 400 }
        );
      }
    }
    
    // Calculate totals
    let subtotal = 0;
    let discount = 0;
    
    for (const item of cartItems) {
      subtotal += Number(item.product.price) * item.quantity;
      if (item.product.originalPrice) {
        discount += (Number(item.product.originalPrice) - Number(item.product.price)) * item.quantity;
      }
    }
    
    const deliveryFee = subtotal >= 499 ? 0 : 29;
    
    // Apply coupon if provided
    let couponDiscount = 0;
    let coupon = null;
    
    if (couponCode) {
      coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode.toUpperCase(),
          isActive: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() },
        },
      });
      
      if (coupon) {
        if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
          return NextResponse.json(
            { error: `Minimum order amount is ₹${coupon.minOrderAmount}` },
            { status: 400 }
          );
        }
        
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return NextResponse.json(
            { error: 'Coupon usage limit exceeded' },
            { status: 400 }
          );
        }
        
        if (coupon.type === 'PERCENTAGE') {
          couponDiscount = (subtotal * Number(coupon.value)) / 100;
          if (coupon.maxDiscount) {
            couponDiscount = Math.min(couponDiscount, Number(coupon.maxDiscount));
          }
        } else {
          couponDiscount = Number(coupon.value);
        }
      }
    }
    
    const total = subtotal - couponDiscount + deliveryFee;
    
    // Check wallet balance for wallet payment
    if (paymentMethod === 'WALLET') {
      const wallet = await prisma.wallet.findUnique({
        where: { userId: session.user.id },
      });
      
      if (!wallet || Number(wallet.balance) < total) {
        return NextResponse.json(
          { error: 'Insufficient wallet balance' },
          { status: 400 }
        );
      }
    }
    
    // Generate order number
    const orderCount = await prisma.order.count();
    const orderNumber = `KT${Date.now().toString().slice(-6)}${(orderCount + 1).toString().padStart(4, '0')}`;
    
    // Create order with transaction
    const order = await prisma.$transaction(async (tx: any) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          addressId,
          deliverySlotId: deliverySlotId || null,
          paymentMethod,
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
          subtotal,
          discount: discount + couponDiscount,
          deliveryFee,
          total,
          couponId: coupon?.id || null,
          couponCode: coupon?.code || null,
          couponDiscount,
          notes: notes || null,
          items: {
            create: cartItems.map((item: any) => ({
              productId: item.productId,
              productName: item.product.name,
              productImage: item.product.images?.[0]?.url || null,
              productUnit: item.product.unit,
              price: Number(item.product.price),
              quantity: item.quantity,
              total: Number(item.product.price) * item.quantity,
            })),
          },
          timeline: {
            create: {
              status: 'PENDING',
              title: 'Order Placed',
              description: 'Your order has been placed successfully',
            },
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { take: 1 },
                },
              },
            },
          },
          address: true,
          timeline: true,
        },
      });
      
      // Update product stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockCount: { decrement: item.quantity },
            stockStatus: item.product.stockCount - item.quantity <= 0 ? 'OUT_OF_STOCK' : 
              item.product.stockCount - item.quantity <= 10 ? 'LOW_STOCK' : 'IN_STOCK',
          },
        });
      }
      
      // Update coupon usage
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }
      
      // Deduct from wallet if wallet payment
      if (paymentMethod === 'WALLET') {
        await tx.wallet.update({
          where: { userId: session.user.id },
          data: { balance: { decrement: total } },
        });
        
        await tx.walletTransaction.create({
          data: {
            walletId: (await tx.wallet.findUnique({ where: { userId: session.user.id } }))!.id,
            type: 'DEBIT',
            amount: total,
            description: `Payment for order #${orderNumber}`,
            referenceId: newOrder.id,
          },
        });
        
        await tx.order.update({
          where: { id: newOrder.id },
          data: { paymentStatus: 'PAID' },
        });
      }
      
      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: session.user.id },
      });
      
      // Create notification
      await tx.notification.create({
        data: {
          userId: session.user.id,
          type: 'ORDER',
          title: 'Order Placed Successfully',
          message: `Your order #${orderNumber} has been placed and will be delivered soon.`,
          data: { orderId: newOrder.id },
        },
      });
      
      return newOrder;
    });
    
    // Send order confirmation email
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, name: true },
      });
      
      if (user?.email) {
        const orderForEmail = {
          ...order,
          user,
          items: order.items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        };
        
        const emailTemplate = emailTemplates.orderConfirmation(orderForEmail);
        await sendEmail({
          to: user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });
      }
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order if email fails
    }
    
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
