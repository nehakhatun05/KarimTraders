import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Get wallet balance and transactions
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // CREDIT, DEBIT
    
    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });
    
    // Create wallet if doesn't exist
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: session.user.id },
      });
    }
    
    const where: any = { walletId: wallet.id };
    
    if (type) {
      where.type = type;
    }
    
    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.walletTransaction.count({ where }),
    ]);
    
    return NextResponse.json({
      balance: wallet.balance,
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}

// Add money to wallet (will be completed after payment verification)
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
    const { amount, paymentId, paymentMethod } = body;
    
    if (!amount || amount < 10) {
      return NextResponse.json(
        { error: 'Minimum amount is ₹10' },
        { status: 400 }
      );
    }
    
    if (amount > 10000) {
      return NextResponse.json(
        { error: 'Maximum amount is ₹10,000 per transaction' },
        { status: 400 }
      );
    }
    
    // In production, verify payment with Razorpay/Stripe
    // For now, we'll simulate successful payment
    
    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });
    
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: session.user.id },
      });
    }
    
    const [updatedWallet, transaction] = await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: session.user.id },
        data: { balance: { increment: amount } },
      }),
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'CREDIT',
          amount,
          description: 'Added money to wallet',
          reference: paymentId || `manual_${Date.now()}`,
        },
      }),
    ]);
    
    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'WALLET',
        title: 'Money Added',
        message: `₹${amount} has been added to your wallet.`,
        data: { transactionId: transaction.id },
      },
    });
    
    return NextResponse.json({
      message: 'Money added successfully',
      balance: updatedWallet.balance,
      transaction,
    });
  } catch (error) {
    console.error('Add money error:', error);
    return NextResponse.json(
      { error: 'Failed to add money' },
      { status: 500 }
    );
  }
}
