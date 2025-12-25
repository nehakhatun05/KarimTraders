import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createRazorpayOrder } from '@/lib/razorpay';

// Create order for online payment
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { addressId, deliverySlotId, notes, couponCode } = body;

    if (!addressId) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // Verify address
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== session.user.id) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            images: true,
          },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Validate stock
    for (const item of cartItems) {
      if (item.product.stockCount < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.product.name}` },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = cartItems.map((item) => {
      const itemTotal = item.product.price * item.quantity;
      subtotal += itemTotal;
      return {
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.images?.[0]?.url || null,
        productUnit: item.product.unit,
        quantity: item.quantity,
        price: item.product.price,
        total: itemTotal,
      };
    });

    // Apply coupon if provided
    let couponDiscount = 0;
    let couponId = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode.toUpperCase(),
          isActive: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() },
        },
      });

      if (coupon) {
        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
        }

        // Check minimum order
        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
          return NextResponse.json(
            { error: `Minimum order of ₹${coupon.minOrderAmount} required` },
            { status: 400 }
          );
        }

        if (coupon.type === 'PERCENTAGE') {
          couponDiscount = (subtotal * coupon.value) / 100;
          if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
            couponDiscount = coupon.maxDiscount;
          }
        } else {
          couponDiscount = coupon.value;
        }

        couponId = coupon.id;
      }
    }

    // Calculate delivery fee
    const deliveryFee = subtotal >= 499 ? 0 : 40;
    const total = subtotal - couponDiscount + deliveryFee;

    // Generate order number
    const orderCount = await prisma.order.count();
    const orderNumber = `KT${Date.now().toString(36).toUpperCase()}${(orderCount + 1).toString().padStart(4, '0')}`;

    // Create order with PENDING payment status
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        addressId,
        paymentMethod: 'ONLINE',
        paymentStatus: 'PENDING',
        status: 'PENDING',
        subtotal,
        discount: couponDiscount,
        deliveryFee,
        total,
        couponId,
        couponCode: couponCode?.toUpperCase(),
        couponDiscount,
        deliverySlotId: deliverySlotId || null,
        notes: notes || null,
        items: {
          create: orderItems,
        },
        timeline: {
          create: {
            status: 'PENDING',
            description: 'Order created. Awaiting payment.',
          },
        },
      },
      include: {
        user: true,
        address: true,
        items: true,
      },
    });

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(total, order.orderNumber);

    // Update order with Razorpay order ID
    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpay: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        name: 'KARIM TRADERS',
        description: `Order #${order.orderNumber}`,
        prefill: {
          name: order.user?.name || '',
          email: order.user?.email || '',
          contact: order.address?.phone || '',
        },
        notes: {
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
        theme: {
          color: '#22c55e',
        },
      },
    });
  } catch (error) {
    console.error('Create online order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

// Cancel pending online order (if payment fails or user cancels)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Only cancel if payment is pending
    if (order.paymentStatus !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cannot cancel paid order' },
        { status: 400 }
      );
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'FAILED',
        cancelledAt: new Date(),
      },
    });

    // Add timeline entry
    await prisma.orderTimeline.create({
      data: {
        orderId,
        status: 'CANCELLED',
        description: 'Order cancelled - Payment not completed.',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel order error:', error);
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
  }
}
