import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
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
        deliverySlot: true,
        timeline: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// Cancel order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        items: true,
      },
    });
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Only allow cancellation for pending/confirmed orders
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return NextResponse.json(
        { error: 'Order cannot be cancelled at this stage' },
        { status: 400 }
      );
    }
    
    // Cancel order with transaction
    await prisma.$transaction(async (tx: any) => {
      // Update order status
      await tx.order.update({
        where: { id: params.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });
      
      // Add timeline entry
      await tx.orderTimeline.create({
        data: {
          orderId: params.id,
          status: 'CANCELLED',
          title: 'Order Cancelled',
          description: 'Order was cancelled by customer',
        },
      });
      
      // Restore product stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockCount: { increment: item.quantity },
            stockStatus: 'IN_STOCK',
          },
        });
      }
      
      // Refund to wallet if paid online or wallet
      if (order.paymentStatus === 'PAID') {
        const wallet = await tx.wallet.findUnique({
          where: { userId: session.user.id },
        });
        
        if (wallet) {
          await tx.wallet.update({
            where: { userId: session.user.id },
            data: { balance: { increment: order.total } },
          });
          
          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              type: 'CREDIT',
              amount: order.total,
              description: `Refund for cancelled order #${order.orderNumber}`,
              referenceId: order.id,
            },
          });
          
          await tx.order.update({
            where: { id: params.id },
            data: { paymentStatus: 'REFUNDED' },
          });
        }
      }
      
      // Create notification
      await tx.notification.create({
        data: {
          userId: session.user.id,
          type: 'ORDER',
          title: 'Order Cancelled',
          message: `Your order #${order.orderNumber} has been cancelled.`,
          data: { orderId: order.id },
        },
      });
    });
    
    return NextResponse.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
