import prisma from '@/lib/prisma';

export type NotificationType = 'ORDER' | 'PROMOTION' | 'SYSTEM' | 'DELIVERY' | 'PAYMENT' | 'WALLET';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

/**
 * Create a notification for a user
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  data,
}: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data || undefined,
        isRead: false,
      },
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

/**
 * Create order-related notifications
 */
export async function notifyOrderCreated(userId: string, orderId: string, orderNumber: string) {
  return createNotification({
    userId,
    type: 'ORDER',
    title: '🛒 Order Placed Successfully!',
    message: `Your order #${orderNumber} has been placed and is being processed.`,
    data: { orderId, orderNumber },
  });
}

export async function notifyOrderConfirmed(userId: string, orderId: string, orderNumber: string) {
  return createNotification({
    userId,
    type: 'ORDER',
    title: '✅ Order Confirmed',
    message: `Your order #${orderNumber} has been confirmed and will be shipped soon.`,
    data: { orderId, orderNumber },
  });
}

export async function notifyOrderShipped(userId: string, orderId: string, orderNumber: string) {
  return createNotification({
    userId,
    type: 'DELIVERY',
    title: '📦 Order Shipped!',
    message: `Your order #${orderNumber} is on its way. Track your delivery in real-time.`,
    data: { orderId, orderNumber },
  });
}

export async function notifyOrderOutForDelivery(userId: string, orderId: string, orderNumber: string) {
  return createNotification({
    userId,
    type: 'DELIVERY',
    title: '🚚 Out for Delivery',
    message: `Your order #${orderNumber} is out for delivery. Get ready!`,
    data: { orderId, orderNumber },
  });
}

export async function notifyOrderDelivered(userId: string, orderId: string, orderNumber: string) {
  return createNotification({
    userId,
    type: 'DELIVERY',
    title: '🎉 Order Delivered!',
    message: `Your order #${orderNumber} has been delivered. Enjoy your purchase!`,
    data: { orderId, orderNumber },
  });
}

export async function notifyOrderCancelled(userId: string, orderId: string, orderNumber: string) {
  return createNotification({
    userId,
    type: 'ORDER',
    title: '❌ Order Cancelled',
    message: `Your order #${orderNumber} has been cancelled. Refund will be processed within 5-7 business days.`,
    data: { orderId, orderNumber },
  });
}

/**
 * Payment notifications
 */
export async function notifyPaymentSuccess(userId: string, amount: number, orderId?: string) {
  return createNotification({
    userId,
    type: 'PAYMENT',
    title: '✅ Payment Successful',
    message: `Your payment of ₹${amount} has been received successfully.`,
    data: { amount, orderId },
  });
}

export async function notifyPaymentFailed(userId: string, amount: number) {
  return createNotification({
    userId,
    type: 'PAYMENT',
    title: '❌ Payment Failed',
    message: `Your payment of ₹${amount} could not be processed. Please try again.`,
    data: { amount },
  });
}

/**
 * Wallet notifications
 */
export async function notifyWalletCredited(userId: string, amount: number, reason?: string) {
  return createNotification({
    userId,
    type: 'WALLET',
    title: '💰 Money Added to Wallet',
    message: reason 
      ? `₹${amount} has been credited to your wallet. ${reason}`
      : `₹${amount} has been credited to your wallet.`,
    data: { amount, reason },
  });
}

export async function notifyWalletDebited(userId: string, amount: number, reason?: string) {
  return createNotification({
    userId,
    type: 'WALLET',
    title: '💳 Wallet Payment',
    message: reason
      ? `₹${amount} has been deducted from your wallet. ${reason}`
      : `₹${amount} has been deducted from your wallet.`,
    data: { amount, reason },
  });
}

export async function notifyCashbackEarned(userId: string, amount: number, orderNumber?: string) {
  return createNotification({
    userId,
    type: 'WALLET',
    title: '🎁 Cashback Earned!',
    message: orderNumber
      ? `Congratulations! You earned ₹${amount} cashback on order #${orderNumber}.`
      : `Congratulations! ₹${amount} cashback has been credited to your wallet.`,
    data: { amount, orderNumber },
  });
}

/**
 * Promotional notifications
 */
export async function notifyPromotion(userId: string, title: string, message: string, promoLink?: string) {
  return createNotification({
    userId,
    type: 'PROMOTION',
    title,
    message,
    data: { promoLink },
  });
}

/**
 * System notifications
 */
export async function notifyWelcome(userId: string, userName: string) {
  return createNotification({
    userId,
    type: 'SYSTEM',
    title: '🎉 Welcome to KARIM TRADERS!',
    message: `Hi ${userName}! Thanks for joining us. Explore our fresh products and enjoy exclusive offers.`,
  });
}

export async function notifyPasswordChanged(userId: string) {
  return createNotification({
    userId,
    type: 'SYSTEM',
    title: '🔐 Password Changed',
    message: 'Your password has been successfully changed. If you did not make this change, please contact support immediately.',
  });
}

export async function notifyProfileUpdated(userId: string) {
  return createNotification({
    userId,
    type: 'SYSTEM',
    title: '✅ Profile Updated',
    message: 'Your profile information has been updated successfully.',
  });
}
