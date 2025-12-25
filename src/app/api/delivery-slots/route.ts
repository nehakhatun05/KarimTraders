import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get available delivery slots
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    const slots = await prisma.deliverySlot.findMany({
      where: { isActive: true },
      orderBy: { startTime: 'asc' },
    });
    
    // In a real app, you'd check slot availability for the specific date
    // and return only available slots with their remaining capacity
    
    const slotsWithAvailability = slots.map((slot) => ({
      ...slot,
      available: true,
      remainingCapacity: slot.maxOrders,
    }));
    
    return NextResponse.json(slotsWithAvailability);
  } catch (error) {
    console.error('Delivery slots fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery slots' },
      { status: 500 }
    );
  }
}
