import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

async function isAdmin(session: any) {
  return session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
}

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
    const period = searchParams.get('period') || '30d';
    
    // Calculate date range
    let startDate = new Date();
    let days = 30;
    switch (period) {
      case '7d':
        days = 7;
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        days = 30;
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        days = 90;
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '365d':
        days = 365;
        startDate.setDate(startDate.getDate() - 365);
        break;
      default:
        days = 30;
        startDate.setDate(startDate.getDate() - 30);
    }
    
    // Fetch orders within period
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        total: true,
        status: true,
        paymentMethod: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            price: true,
            productId: true,
            product: {
              select: { name: true, categoryId: true },
            },
          },
        },
      },
    });
    
    // Calculate daily revenue
    const dailyRevenue: { date: string; revenue: number; orders: number }[] = [];
    const revenueMap = new Map<string, { revenue: number; orders: number }>();
    
    orders.forEach((order: any) => {
      const dateKey = new Date(order.createdAt).toISOString().split('T')[0];
      const existing = revenueMap.get(dateKey) || { revenue: 0, orders: 0 };
      revenueMap.set(dateKey, {
        revenue: existing.revenue + order.total,
        orders: existing.orders + 1,
      });
    });
    
    // Fill in missing dates
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const data = revenueMap.get(dateKey) || { revenue: 0, orders: 0 };
      dailyRevenue.unshift({
        date: dateKey,
        ...data,
      });
    }
    
    // Order status distribution
    const statusCounts: Record<string, number> = {};
    orders.forEach((order: any) => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    
    const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));
    
    // Payment method distribution
    const paymentCounts: Record<string, number> = {};
    orders.forEach((order: any) => {
      const method = order.paymentMethod || 'Unknown';
      paymentCounts[method] = (paymentCounts[method] || 0) + 1;
    });
    
    const ordersByPayment = Object.entries(paymentCounts).map(([method, count]) => ({
      method,
      count,
    }));
    
    // Top selling products
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        const productId = item.productId;
        const existing = productSales[productId] || { 
          name: item.product?.name || 'Unknown', 
          quantity: 0, 
          revenue: 0 
        };
        productSales[productId] = {
          name: existing.name,
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + (item.price * item.quantity),
        };
      });
    });
    
    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    // Category performance
    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
    });
    
    const categoryMap = new Map(categories.map((c: any) => [c.id, c.name]));
    const categorySales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        const categoryId = item.product?.categoryId;
        if (categoryId) {
          const existing = categorySales[categoryId] || { 
            name: categoryMap.get(categoryId) || 'Unknown', 
            quantity: 0, 
            revenue: 0 
          };
          categorySales[categoryId] = {
            name: existing.name,
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + (item.price * item.quantity),
          };
        }
      });
    });
    
    const categoryPerformance = Object.entries(categorySales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
    
    // Summary stats
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Compare with previous period
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);
    
    const prevOrders = await prisma.order.findMany({
      where: {
        createdAt: { 
          gte: prevStartDate,
          lt: startDate,
        },
      },
      select: { total: true },
    });
    
    const prevRevenue = prevOrders.reduce((sum: number, o: any) => sum + o.total, 0);
    const prevTotalOrders = prevOrders.length;
    
    const revenueGrowth = prevRevenue > 0 
      ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 
      : totalRevenue > 0 ? 100 : 0;
    
    const ordersGrowth = prevTotalOrders > 0 
      ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100 
      : totalOrders > 0 ? 100 : 0;
    
    // New customers in period
    const newCustomers = await prisma.user.count({
      where: {
        createdAt: { gte: startDate },
        role: 'CUSTOMER',
      },
    });
    
    const prevNewCustomers = await prisma.user.count({
      where: {
        createdAt: { 
          gte: prevStartDate,
          lt: startDate,
        },
        role: 'CUSTOMER',
      },
    });
    
    const customerGrowth = prevNewCustomers > 0 
      ? ((newCustomers - prevNewCustomers) / prevNewCustomers) * 100 
      : newCustomers > 0 ? 100 : 0;
    
    return NextResponse.json({
      period,
      summary: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        newCustomers,
        revenueGrowth,
        ordersGrowth,
        customerGrowth,
      },
      dailyRevenue,
      ordersByStatus,
      ordersByPayment,
      topProducts,
      categoryPerformance,
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
