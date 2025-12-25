import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Fetch all active service areas (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode');
    const all = searchParams.get('all') === 'true';

    // If checking specific pincode
    if (pincode) {
      const serviceArea = await prisma.serviceArea.findFirst({
        where: {
          pincode: pincode,
          isActive: true,
        },
      });

      return NextResponse.json({
        isServiceable: !!serviceArea,
        serviceArea: serviceArea || null,
      });
    }

    // Get all service areas (for admin or dropdown)
    const serviceAreas = await prisma.serviceArea.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { city: 'asc' },
    });

    return NextResponse.json({ serviceAreas });
  } catch (error) {
    console.error('Error fetching service areas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service areas' },
      { status: 500 }
    );
  }
}

// POST - Add new service area (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pincode, area, city, state, deliveryTime, deliveryFee, minOrderValue, isActive } = body;

    if (!pincode || !area || !city || !state) {
      return NextResponse.json(
        { error: 'Pincode, area, city, and state are required' },
        { status: 400 }
      );
    }

    // Check if pincode already exists
    const existing = await prisma.serviceArea.findUnique({
      where: { pincode },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Service area with this pincode already exists' },
        { status: 400 }
      );
    }

    const serviceArea = await prisma.serviceArea.create({
      data: {
        pincode,
        area,
        city,
        state,
        deliveryTime: deliveryTime || '30 mins',
        deliveryFee: deliveryFee || 0,
        minOrderValue: minOrderValue || 0,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ serviceArea }, { status: 201 });
  } catch (error) {
    console.error('Error creating service area:', error);
    return NextResponse.json(
      { error: 'Failed to create service area' },
      { status: 500 }
    );
  }
}

// DELETE - Remove service area (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.serviceArea.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service area:', error);
    return NextResponse.json(
      { error: 'Failed to delete service area' },
      { status: 500 }
    );
  }
}

// PUT - Update service area (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const serviceArea = await prisma.serviceArea.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ serviceArea });
  } catch (error) {
    console.error('Error updating service area:', error);
    return NextResponse.json(
      { error: 'Failed to update service area' },
      { status: 500 }
    );
  }
}
