import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const addressUpdateSchema = z.object({
  type: z.enum(['HOME', 'WORK', 'OTHER']).optional(),
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  addressLine1: z.string().min(5).max(200).optional(),
  addressLine2: z.string().max(200).optional(),
  landmark: z.string().max(100).optional(),
  city: z.string().min(2).max(100).optional(),
  state: z.string().min(2).max(100).optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  isDefault: z.boolean().optional(),
});

// Get single address
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
    
    const address = await prisma.address.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(address);
  } catch (error) {
    console.error('Address fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch address' },
      { status: 500 }
    );
  }
}

// Update address
export async function PUT(
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
    
    // Verify ownership
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });
    
    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const validation = addressUpdateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { isDefault, ...addressData } = validation.data;
    
    // If making this default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          id: { not: params.id },
        },
        data: { isDefault: false },
      });
    }
    
    const address = await prisma.address.update({
      where: { id: params.id },
      data: {
        ...addressData,
        ...(isDefault !== undefined && { isDefault }),
      },
    });
    
    return NextResponse.json(address);
  } catch (error) {
    console.error('Update address error:', error);
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    );
  }
}

// Delete address
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
    
    // Verify ownership
    const address = await prisma.address.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }
    
    // Check if address is used in any pending orders
    const ordersWithAddress = await prisma.order.count({
      where: {
        addressId: params.id,
        status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY'] },
      },
    });
    
    if (ordersWithAddress > 0) {
      return NextResponse.json(
        { error: 'Cannot delete address used in pending orders' },
        { status: 400 }
      );
    }
    
    await prisma.address.delete({
      where: { id: params.id },
    });
    
    // If deleted address was default, make another address default
    if (address.isDefault) {
      const nextAddress = await prisma.address.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
      });
      
      if (nextAddress) {
        await prisma.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }
    
    return NextResponse.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}
