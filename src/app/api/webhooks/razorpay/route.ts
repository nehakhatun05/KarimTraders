import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

// Razorpay webhook handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }
    
    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('Razorpay webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }
    
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      // Log failed verification
      await prisma.webhookLog.create({
        data: {
          provider: 'RAZORPAY',
          event: 'SIGNATURE_FAILED',
          payload: { body: body.substring(0, 500) },
          status: 'FAILED',
        },
      });
      
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }
    
    const event = JSON.parse(body);
    
    // Log webhook event
    const webhookLog = await prisma.webhookLog.create({
      data: {
        provider: 'RAZORPAY',
        event: event.event,
        payload: event,
        status: 'PENDING',
      },
    });
    
    try {
      switch (event.event) {
        case 'payment.captured':
          await handlePaymentCaptured(event.payload.payment.entity);
          break;
          
        case 'payment.failed':
          await handlePaymentFailed(event.payload.payment.entity);
          break;
          
        case 'refund.created':
          await handleRefundCreated(event.payload.refund.entity);
          break;
          
        case 'order.paid':
          await handleOrderPaid(event.payload.order.entity);
          break;
          
        default:
          console.log('Unhandled event:', event.event);
      }
      
      // Update webhook log
      await prisma.webhookLog.update({
        where: { id: webhookLog.id },
        data: { status: 'SUCCESS' },
      });
      
    } catch (error) {
      console.error('Webhook processing error:', error);
      
      await prisma.webhookLog.update({
        where: { id: webhookLog.id },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(payment: any) {
  const { order_id, id: paymentId, amount, notes } = payment;
  const orderId = notes?.orderId;
  
  if (orderId) {
    await prisma.$transaction(async (tx: any) => {
      // Update order payment status
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          paymentId,
          status: 'CONFIRMED',
        },
      });
      
      // Add timeline entry
      await tx.orderTimeline.create({
        data: {
          orderId,
          status: 'CONFIRMED',
          title: 'Payment Successful',
          description: `Payment of ₹${amount / 100} received`,
        },
      });
      
      // Create notification
      await tx.notification.create({
        data: {
          userId: order.userId,
          type: 'ORDER',
          title: 'Payment Successful',
          message: `Your payment of ₹${amount / 100} for order #${order.orderNumber} was successful.`,
          data: { orderId },
        },
      });
    });
  }
  
  // Handle wallet top-up
  const walletUserId = notes?.walletUserId;
  
  if (walletUserId) {
    await prisma.$transaction(async (tx: any) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId: walletUserId },
      });
      
      if (wallet) {
        await tx.wallet.update({
          where: { userId: walletUserId },
          data: { balance: { increment: amount / 100 } },
        });
        
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'CREDIT',
            amount: amount / 100,
            description: 'Added money via Razorpay',
            referenceId: paymentId,
          },
        });
        
        await tx.notification.create({
          data: {
            userId: walletUserId,
            type: 'WALLET',
            title: 'Money Added',
            message: `₹${amount / 100} has been added to your wallet.`,
            data: { paymentId },
          },
        });
      }
    });
  }
}

async function handlePaymentFailed(payment: any) {
  const { notes, error_description } = payment;
  const orderId = notes?.orderId;
  
  if (orderId) {
    await prisma.$transaction(async (tx: any) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' },
      });
      
      await tx.orderTimeline.create({
        data: {
          orderId,
          status: 'PENDING',
          title: 'Payment Failed',
          description: error_description || 'Payment could not be processed',
        },
      });
      
      await tx.notification.create({
        data: {
          userId: order.userId,
          type: 'ORDER',
          title: 'Payment Failed',
          message: `Payment for order #${order.orderNumber} failed. Please try again.`,
          data: { orderId },
        },
      });
    });
  }
}

async function handleRefundCreated(refund: any) {
  const { payment_id, amount, notes } = refund;
  const orderId = notes?.orderId;
  
  if (orderId) {
    await prisma.$transaction(async (tx: any) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });
      
      if (order) {
        await tx.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'REFUNDED' },
        });
        
        await tx.orderTimeline.create({
          data: {
            orderId,
            status: order.status,
            title: 'Refund Initiated',
            description: `Refund of ₹${amount / 100} initiated`,
          },
        });
        
        await tx.notification.create({
          data: {
            userId: order.userId,
            type: 'ORDER',
            title: 'Refund Initiated',
            message: `Refund of ₹${amount / 100} for order #${order.orderNumber} has been initiated.`,
            data: { orderId },
          },
        });
      }
    });
  }
}

async function handleOrderPaid(razorpayOrder: any) {
  // Handle Razorpay order paid event
  console.log('Order paid:', razorpayOrder.id);
}
