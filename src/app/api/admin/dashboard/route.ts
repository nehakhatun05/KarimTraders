import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Types for groupBy results
type TopProduct = { productId: string; _sum: { quantity: number | null } };
type OrderByStatus = { status: string; _count: number };
type ProductDetail = { id: string; name: string; price: any };

// Admin middleware check
async function isAdmin(session: any) {
  return session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
}

// Get dashboard stats
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
    const period = searchParams.get('period') || '7d';
    
    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }
    
    // Fetch all stats in parallel
    const [
      totalOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
      recentOrders,
      ordersByStatus,
      topProducts,
      lowStockProducts,
      revenueByDay,
      newUsers,
      pendingOrders,
    ] = await Promise.all([
      // Total orders
      prisma.order.count({
        where: { createdAt: { gte: startDate } },
      }),
      
      // Total revenue
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          paymentStatus: 'PAID',
        },
        _sum: { total: true },
      }),
      
      // Total users
      prisma.user.count(),
      
      // Total products
      prisma.product.count({ where: { isActive: true } }),
      
      // Recent orders
      prisma.order.findMany({
        include: {
          user: { select: { name: true, email: true } },
          items: { take: 3, include: { product: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      
      // Orders by status
      prisma.order.groupBy({
        by: ['status'],
        where: { createdAt: { gte: startDate } },
        _count: true,
      }),
      
      // Top selling products
      prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            createdAt: { gte: startDate },
            status: { not: 'CANCELLED' },
          },
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),
      
      // Low stock products
      prisma.product.findMany({
        where: {
          isActive: true,
          stockCount: { lte: 10 },
        },
        select: {
          id: true,
          name: true,
          stockCount: true,
          stockStatus: true,
        },
        orderBy: { stockCount: 'asc' },
        take: 10,
      }),
      
      // Revenue by day - fetch orders and group in JavaScript (MongoDB compatible)
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          paymentStatus: 'PAID',
        },
        select: {
          createdAt: true,
          total: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      
      // New users in period
      prisma.user.count({
        where: { createdAt: { gte: startDate } },
      }),
      
      // Pending orders count
      prisma.order.count({
        where: { status: 'PENDING' },
      }),
    ]);

    // Process revenue by day (group in JavaScript)
    const revenueByDayMap = new Map<string, number>();
    (revenueByDay as any[]).forEach((order: any) => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      const currentRevenue = revenueByDayMap.get(dateKey) || 0;
      revenueByDayMap.set(dateKey, currentRevenue + Number(order.total));
    });
    const revenueByDayData = Array.from(revenueByDayMap.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }));
    
    // Get product details for top products
    const topProductIds = topProducts.map((p: TopProduct) => p.productId);
    const productDetails = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true, price: true },
    });
    
    const topProductsWithDetails = topProducts.map((tp: TopProduct) => ({
      ...productDetails.find((p: ProductDetail) => p.id === tp.productId),
      totalSold: tp._sum.quantity,
    }));
    
    // Calculate growth percentages
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - (period === '24h' ? 1 : period === '7d' ? 7 : 30));
    
    const [previousOrders, previousRevenue] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: startDate,
          },
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: startDate,
          },
          paymentStatus: 'PAID',
        },
        _sum: { total: true },
      }),
    ]);
    
    const orderGrowth = previousOrders > 0 
      ? ((totalOrders - previousOrders) / previousOrders * 100).toFixed(1)
      : 100;
      
    const revenueGrowth = previousRevenue._sum.total && Number(previousRevenue._sum.total) > 0
      ? (((Number(totalRevenue._sum.total) || 0) - Number(previousRevenue._sum.total)) / Number(previousRevenue._sum.total) * 100).toFixed(1)
      : 100;
    
    return NextResponse.json({
      overview: {
        totalOrders,
        totalRevenue: Number(totalRevenue._sum.total) || 0,
        totalUsers,
        totalProducts,
        newUsers,
        pendingOrders,
        orderGrowth: Number(orderGrowth),
        revenueGrowth: Number(revenueGrowth),
      },
      recentOrders,
      ordersByStatus: Object.fromEntries(
        ordersByStatus.map((s: OrderByStatus) => [s.status, s._count])
      ),
      topProducts: topProductsWithDetails,
      lowStockProducts,
      revenueByDay: revenueByDayData,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
