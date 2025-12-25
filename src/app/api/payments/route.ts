import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Razorpay from 'razorpay';
import Stripe from 'stripe';

// Initialize payment providers lazily to avoid build-time errors
let razorpay: Razorpay | null = null;
let stripe: Stripe | null = null;

function getRazorpay(): Razorpay {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
}

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

// Create payment order
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
    const { amount, currency = 'INR', provider = 'razorpay', metadata = {} } = body;
    
    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }
    
    if (provider === 'razorpay') {
      // Create Razorpay order
      const order = await getRazorpay().orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt: `receipt_${Date.now()}`,
        notes: {
          ...metadata,
          userId: session.user.id,
        },
      });
      
      return NextResponse.json({
        provider: 'razorpay',
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    } else if (provider === 'stripe') {
      // Create Stripe checkout session
      const checkoutSession = await getStripe().checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: metadata.productName || 'KARIM TRADERS Payment',
                description: metadata.description || 'Order payment',
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/checkout?cancelled=true`,
        metadata: {
          ...metadata,
          userId: session.user.id,
        },
      });
      
      return NextResponse.json({
        provider: 'stripe',
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid payment provider' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

// Verify payment
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
    const { provider, paymentId, orderId, signature, sessionId } = body;
    
    if (provider === 'razorpay') {
      // Verify Razorpay payment signature
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        return NextResponse.json(
          { error: 'Invalid payment signature' },
          { status: 400 }
        );
      }
      
      return NextResponse.json({
        verified: true,
        paymentId,
        orderId,
      });
    } else if (provider === 'stripe') {
      // Verify Stripe session
      const checkoutSession = await getStripe().checkout.sessions.retrieve(sessionId);
      
      if (checkoutSession.payment_status !== 'paid') {
        return NextResponse.json(
          { error: 'Payment not completed' },
          { status: 400 }
        );
      }
      
      return NextResponse.json({
        verified: true,
        sessionId,
        paymentIntent: checkoutSession.payment_intent,
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid provider' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
