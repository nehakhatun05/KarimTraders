import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { sendEmail, emailTemplates } from '@/lib/email';

const updateOrderSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ]).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  notes: z.string().optional(),
  deliveryPersonId: z.string().optional(),
});

async function isAdmin(session: any) {
  return session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
}

// Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!await isAdmin(session)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
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
    console.error('Admin order fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!await isAdmin(session)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const validation = updateOrderSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { status, paymentStatus, notes, deliveryPersonId } = validation.data;
    
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
    });
    
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Status transition messages
    const statusMessages: Record<string, { title: string; description: string }> = {
      CONFIRMED: {
        title: 'Order Confirmed',
        description: 'Your order has been confirmed and is being prepared',
      },
      PREPARING: {
        title: 'Order Being Prepared',
        description: 'Your order is being packed and prepared for delivery',
      },
      OUT_FOR_DELIVERY: {
        title: 'Out for Delivery',
        description: 'Your order is on the way',
      },
      DELIVERED: {
        title: 'Order Delivered',
        description: 'Your order has been delivered successfully',
      },
      CANCELLED: {
        title: 'Order Cancelled',
        description: 'Your order has been cancelled',
      },
    };
    
    const order = await prisma.$transaction(async (tx: any) => {
      const updateData: any = {};
      
      if (status) {
        updateData.status = status;
        
        if (status === 'DELIVERED') {
          updateData.deliveredAt = new Date();
        } else if (status === 'CANCELLED') {
          updateData.cancelledAt = new Date();
        }
      }
      
      if (paymentStatus) {
        updateData.paymentStatus = paymentStatus;
      }
      
      if (notes !== undefined) {
        updateData.notes = notes;
      }
      
      const updatedOrder = await tx.order.update({
        where: { id: params.id },
        data: updateData,
        include: {
          user: { select: { name: true, email: true } },
          items: true,
        },
      });
      
      // Add timeline entry for status change
      if (status && statusMessages[status]) {
        await tx.orderTimeline.create({
          data: {
            orderId: params.id,
            status,
            title: statusMessages[status].title,
            description: statusMessages[status].description,
          },
        });
        
        // Create notification for user
        await tx.notification.create({
          data: {
            userId: updatedOrder.userId,
            type: 'ORDER',
            title: statusMessages[status].title,
            message: `Order #${updatedOrder.orderNumber}: ${statusMessages[status].description}`,
            data: { orderId: params.id },
          },
        });
      }
      
      // Handle cancellation - restore stock
      if (status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
        for (const item of updatedOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockCount: { increment: item.quantity },
              stockStatus: 'IN_STOCK',
            },
          });
        }
        
        // Refund if paid
        if (existingOrder.paymentStatus === 'PAID') {
          const wallet = await tx.wallet.findUnique({
            where: { userId: updatedOrder.userId },
          });
          
          if (wallet) {
            await tx.wallet.update({
              where: { userId: updatedOrder.userId },
              data: { balance: { increment: existingOrder.total } },
            });
            
            await tx.walletTransaction.create({
              data: {
                walletId: wallet.id,
                type: 'CREDIT',
                amount: existingOrder.total,
                description: `Refund for cancelled order #${updatedOrder.orderNumber}`,
                referenceId: params.id,
              },
            });
            
            await tx.order.update({
              where: { id: params.id },
              data: { paymentStatus: 'REFUNDED' },
            });
          }
        }
      }
      
      return updatedOrder;
    });
    
    // Send email notification for status update
    if (status && statusMessages[status] && order.user?.email) {
      try {
        const statusMessage = statusMessages[status].description;
        const emailTemplate = emailTemplates.orderStatusUpdate(
          order,
          status,
          statusMessage
        );
        
        await sendEmail({
          to: order.user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
      }
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Admin order update error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
