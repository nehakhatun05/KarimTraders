import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Get user's cart
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            images: { take: 1 },
            category: {
              select: { name: true, slug: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // Calculate totals
    const subtotal = cartItems.reduce((sum: number, item: any) => {
      return sum + (Number(item.product.price) * item.quantity);
    }, 0);
    
    const originalTotal = cartItems.reduce((sum: number, item: any) => {
      const price = item.product.originalPrice || item.product.price;
      return sum + (Number(price) * item.quantity);
    }, 0);
    
    const totalDiscount = originalTotal - subtotal;
    const itemCount = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
    
    return NextResponse.json({
      items: cartItems,
      subtotal,
      originalTotal,
      totalDiscount,
      itemCount,
      deliveryFee: subtotal >= 499 ? 0 : 29,
      total: subtotal + (subtotal >= 499 ? 0 : 29),
    });
  } catch (error) {
    console.error('Cart fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// Add item to cart
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
    const { productId, quantity = 1 } = body;
    
    // Check if product exists and is in stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    if (product.stockStatus === 'OUT_OF_STOCK') {
      return NextResponse.json(
        { error: 'Product is out of stock' },
        { status: 400 }
      );
    }
    
    if (quantity > product.stockCount) {
      return NextResponse.json(
        { error: `Only ${product.stockCount} items available` },
        { status: 400 }
      );
    }
    
    // Upsert cart item
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        userId: session.user.id,
        productId,
        quantity,
      },
      include: {
        product: {
          include: {
            images: { take: 1 },
          },
        },
      },
    });
    
    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

// Update cart item quantity
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
    const { productId, quantity } = body;
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await prisma.cartItem.delete({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId,
          },
        },
      });
      
      return NextResponse.json({ message: 'Item removed from cart' });
    }
    
    // Check stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (product && quantity > product.stockCount) {
      return NextResponse.json(
        { error: `Only ${product.stockCount} items available` },
        { status: 400 }
      );
    }
    
    const cartItem = await prisma.cartItem.update({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      data: { quantity },
      include: {
        product: {
          include: {
            images: { take: 1 },
          },
        },
      },
    });
    
    return NextResponse.json(cartItem);
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

// Clear cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (productId) {
      // Remove single item
      await prisma.cartItem.delete({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId,
          },
        },
      });
      
      return NextResponse.json({ message: 'Item removed from cart' });
    }
    
    // Clear entire cart
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    });
    
    return NextResponse.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Delete cart error:', error);
    return NextResponse.json(
      { error: 'Failed to delete cart item' },
      { status: 500 }
    );
  }
}
