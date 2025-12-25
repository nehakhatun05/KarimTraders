import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { sendEmail, emailTemplates } from '@/lib/email';

// Verify Razorpay payment
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        address: true,
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify order belongs to user
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update order payment status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        paymentId: razorpay_payment_id,
        razorpayPaymentId: razorpay_payment_id,
        status: 'CONFIRMED',
      },
      include: {
        user: true,
        address: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Add timeline entry
    await prisma.orderTimeline.create({
      data: {
        orderId: order.id,
        status: 'CONFIRMED',
        description: 'Payment successful. Order confirmed.',
      },
    });

    // Send order confirmation email
    if (order.user?.email) {
      const emailTemplate = emailTemplates.orderConfirmation({
        ...updatedOrder,
        items: updatedOrder.items.map(item => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      await sendEmail({
        to: order.user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: 'Payment Successful',
        message: `Payment for order #${order.orderNumber} has been confirmed.`,
        type: 'ORDER',
        data: JSON.stringify({
          orderId: order.id,
          orderNumber: order.orderNumber,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
