import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';

async function isAdmin(session: any) {
  return session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
}

// Get low stock products
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!await isAdmin(session)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeOutOfStock = searchParams.get('includeOutOfStock') === 'true';

    // Get products with low stock (stock count <= lowStockAlert threshold)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          {
            stockStatus: 'LOW_STOCK',
          },
          {
            AND: [
              { stockCount: { lte: prisma.product.fields.lowStockAlert } },
              { stockCount: { gt: 0 } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        stockCount: true,
        lowStockAlert: true,
        stockStatus: true,
        images: {
          take: 1,
          select: { url: true },
        },
        category: {
          select: { name: true },
        },
      },
      orderBy: { stockCount: 'asc' },
    });

    // Get out of stock products
    let outOfStockProducts: any[] = [];
    if (includeOutOfStock) {
      outOfStockProducts = await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { stockStatus: 'OUT_OF_STOCK' },
            { stockCount: { lte: 0 } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          stockCount: true,
          lowStockAlert: true,
          stockStatus: true,
          images: {
            take: 1,
            select: { url: true },
          },
          category: {
            select: { name: true },
          },
        },
        orderBy: { name: 'asc' },
      });
    }

    // Get summary stats
    const stats = await prisma.product.groupBy({
      by: ['stockStatus'],
      where: { isActive: true },
      _count: true,
    });

    const summary = {
      lowStock: stats.find(s => s.stockStatus === 'LOW_STOCK')?._count || 0,
      outOfStock: stats.find(s => s.stockStatus === 'OUT_OF_STOCK')?._count || 0,
      inStock: stats.find(s => s.stockStatus === 'IN_STOCK')?._count || 0,
    };

    return NextResponse.json({
      lowStockProducts,
      outOfStockProducts,
      summary,
    });
  } catch (error) {
    console.error('Inventory alerts fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory alerts' },
      { status: 500 }
    );
  }
}

// Send inventory alert email to admins
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!await isAdmin(session)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type } = body; // 'low_stock' or 'out_of_stock'

    // Get admin emails
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        isActive: true,
      },
      select: { email: true },
    });

    if (admins.length === 0) {
      return NextResponse.json(
        { error: 'No admin emails found' },
        { status: 400 }
      );
    }

    const adminEmails = admins.map(a => a.email).filter(Boolean) as string[];

    if (type === 'out_of_stock') {
      // Get out of stock products
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { stockStatus: 'OUT_OF_STOCK' },
            { stockCount: { lte: 0 } },
          ],
        },
        select: {
          name: true,
          sku: true,
        },
      });

      if (products.length === 0) {
        return NextResponse.json({ message: 'No out of stock products' });
      }

      const emailTemplate = emailTemplates.outOfStockAlert(products);
      
      for (const email of adminEmails) {
        await sendEmail({
          to: email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });
      }

      return NextResponse.json({
        success: true,
        message: `Out of stock alert sent for ${products.length} products`,
      });
    } else {
      // Get low stock products
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          stockStatus: 'LOW_STOCK',
          stockCount: { gt: 0 },
        },
        select: {
          name: true,
          sku: true,
          stockCount: true,
          lowStockAlert: true,
        },
      });

      if (products.length === 0) {
        return NextResponse.json({ message: 'No low stock products' });
      }

      const emailTemplate = emailTemplates.lowStockAlert(products);
      
      for (const email of adminEmails) {
        await sendEmail({
          to: email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });
      }

      return NextResponse.json({
        success: true,
        message: `Low stock alert sent for ${products.length} products`,
      });
    }
  } catch (error) {
    console.error('Send inventory alert error:', error);
    return NextResponse.json(
      { error: 'Failed to send inventory alert' },
      { status: 500 }
    );
  }
}

// Update stock for a product
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!await isAdmin(session)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { productId, stockCount, lowStockAlert } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    
    if (typeof stockCount === 'number') {
      updateData.stockCount = stockCount;
      // Update stock status based on new count
      if (stockCount <= 0) {
        updateData.stockStatus = 'OUT_OF_STOCK';
      } else if (stockCount <= (lowStockAlert || 10)) {
        updateData.stockStatus = 'LOW_STOCK';
      } else {
        updateData.stockStatus = 'IN_STOCK';
      }
    }
    
    if (typeof lowStockAlert === 'number') {
      updateData.lowStockAlert = lowStockAlert;
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      select: {
        id: true,
        name: true,
        stockCount: true,
        stockStatus: true,
        lowStockAlert: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Update stock error:', error);
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    );
  }
}
