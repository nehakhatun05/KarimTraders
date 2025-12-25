import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

// Initialize Stripe lazily to avoid build-time errors
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe credentials not configured');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover' as const,
    });
  }
  return stripe;
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }
    
    let event: Stripe.Event;
    
    try {
      event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      // Log failed verification
      await prisma.webhookLog.create({
        data: {
          provider: 'STRIPE',
          event: 'SIGNATURE_FAILED',
          payload: { body: body.substring(0, 500) },
          status: 'FAILED',
          error: err instanceof Error ? err.message : 'Signature verification failed',
        },
      });
      
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }
    
    // Log webhook event
    const webhookLog = await prisma.webhookLog.create({
      data: {
        provider: 'STRIPE',
        event: event.type,
        payload: event.data.object as any,
        status: 'PENDING',
      },
    });
    
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;
          
        case 'payment_intent.succeeded':
          await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
          
        case 'payment_intent.payment_failed':
          await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
          
        case 'charge.refunded':
          await handleRefund(event.data.object as Stripe.Charge);
          break;
          
        default:
          console.log('Unhandled Stripe event:', event.type);
      }
      
      // Update webhook log
      await prisma.webhookLog.update({
        where: { id: webhookLog.id },
        data: { status: 'SUCCESS' },
      });
      
    } catch (error) {
      console.error('Stripe webhook processing error:', error);
      
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
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  const walletUserId = session.metadata?.walletUserId;
  
  if (orderId) {
    await prisma.$transaction(async (tx: any) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          paymentId: session.payment_intent as string,
          status: 'CONFIRMED',
        },
      });
      
      await tx.orderTimeline.create({
        data: {
          orderId,
          status: 'CONFIRMED',
          title: 'Payment Successful',
          description: 'Payment received via Stripe',
        },
      });
      
      await tx.notification.create({
        data: {
          userId: order.userId,
          type: 'ORDER',
          title: 'Payment Successful',
          message: `Your payment for order #${order.orderNumber} was successful.`,
          data: { orderId },
        },
      });
    });
  }
  
  if (walletUserId && session.amount_total) {
    const amount = session.amount_total / 100; // Convert from cents
    
    await prisma.$transaction(async (tx: any) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId: walletUserId },
      });
      
      if (wallet) {
        await tx.wallet.update({
          where: { userId: walletUserId },
          data: { balance: { increment: amount } },
        });
        
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'CREDIT',
            amount,
            description: 'Added money via Stripe',
            referenceId: session.id,
          },
        });
        
        await tx.notification.create({
          data: {
            userId: walletUserId,
            type: 'WALLET',
            title: 'Money Added',
            message: `₹${amount} has been added to your wallet.`,
            data: { sessionId: session.id },
          },
        });
      }
    });
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;
  
  if (orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    
    if (order && order.paymentStatus !== 'PAID') {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          paymentId: paymentIntent.id,
        },
      });
    }
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;
  
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
          description: paymentIntent.last_payment_error?.message || 'Payment could not be processed',
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

async function handleRefund(charge: Stripe.Charge) {
  const orderId = charge.metadata?.orderId;
  
  if (orderId && charge.amount_refunded) {
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
            title: 'Refund Processed',
            description: `Refund of ₹${charge.amount_refunded / 100} processed`,
          },
        });
        
        await tx.notification.create({
          data: {
            userId: order.userId,
            type: 'ORDER',
            title: 'Refund Processed',
            message: `Refund of ₹${charge.amount_refunded / 100} for order #${order.orderNumber} has been processed.`,
            data: { orderId },
          },
        });
      }
    });
  }
}
