import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"KARIM TRADERS" <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to KARIM TRADERS!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #22c55e; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to KARIM TRADERS!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for creating an account with KARIM TRADERS. We're excited to have you on board!</p>
            <p>Start exploring our wide range of fresh groceries:</p>
            <ul>
              <li>🍎 Fresh Fruits</li>
              <li>🥬 Fresh Vegetables</li>
              <li>🥜 Premium Dry Fruits</li>
              <li>🌶️ Authentic Spices</li>
            </ul>
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" class="button">Start Shopping</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} KARIM TRADERS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  orderConfirmation: (order: any) => ({
    subject: `Order Confirmed - #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #22c55e; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .total { font-weight: bold; font-size: 18px; color: #22c55e; }
          .button { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed! ✓</h1>
          </div>
          <div class="content">
            <p>Hi ${order.user?.name || 'Customer'},</p>
            <p>Thank you for your order! We've received your order and it's being processed.</p>
            
            <div class="order-details">
              <h3>Order #${order.orderNumber}</h3>
              <p>Placed on: ${new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
              
              <h4>Items:</h4>
              ${order.items.map((item: any) => `
                <div class="item">
                  <span>${item.name} × ${item.quantity}</span>
                  <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
              
              <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #22c55e;">
                <div class="item">
                  <span>Subtotal</span>
                  <span>₹${order.subtotal.toFixed(2)}</span>
                </div>
                ${order.discount > 0 ? `
                <div class="item">
                  <span>Discount</span>
                  <span>-₹${order.discount.toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="item">
                  <span>Delivery Fee</span>
                  <span>${order.deliveryFee > 0 ? `₹${order.deliveryFee.toFixed(2)}` : 'FREE'}</span>
                </div>
                <div class="item total">
                  <span>Total</span>
                  <span>₹${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <h4>Delivery Address:</h4>
            <p>
              ${order.address?.name}<br>
              ${order.address?.addressLine1}<br>
              ${order.address?.addressLine2 ? order.address.addressLine2 + '<br>' : ''}
              ${order.address?.city}, ${order.address?.state} - ${order.address?.pincode}
            </p>
            
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${order.id}" class="button">Track Order</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} KARIM TRADERS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  orderStatusUpdate: (order: any, status: string, message: string) => ({
    subject: `Order Update - #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #22c55e; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .status-badge { display: inline-block; background: #22c55e; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
          .button { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Update</h1>
          </div>
          <div class="content">
            <p>Hi ${order.user?.name || 'Customer'},</p>
            <p>Your order #${order.orderNumber} has been updated:</p>
            
            <p style="text-align: center; margin: 20px 0;">
              <span class="status-badge">${status.replace(/_/g, ' ')}</span>
            </p>
            
            <p>${message}</p>
            
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${order.id}" class="button">View Order Details</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} KARIM TRADERS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  passwordReset: (name: string, resetUrl: string) => ({
    subject: 'Reset Your Password - KARIM TRADERS',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #22c55e; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            
            <p>If you didn't request this, you can safely ignore this email. Your password won't be changed.</p>
            <p>This link will expire in 1 hour.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} KARIM TRADERS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  lowStockAlert: (products: Array<{ name: string; sku: string; stockCount: number; lowStockAlert: number }>) => ({
    subject: '⚠️ Low Stock Alert - KARIM TRADERS',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .product-list { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .product-item { padding: 10px 0; border-bottom: 1px solid #eee; }
          .product-item:last-child { border-bottom: none; }
          .stock-warning { color: #f59e0b; font-weight: bold; }
          .stock-critical { color: #ef4444; font-weight: bold; }
          .button { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Low Stock Alert</h1>
          </div>
          <div class="content">
            <p>The following products are running low on stock and need attention:</p>
            
            <div class="product-list">
              ${products.map(product => `
                <div class="product-item">
                  <strong>${product.name}</strong><br>
                  <span>SKU: ${product.sku}</span><br>
                  <span class="${product.stockCount <= 5 ? 'stock-critical' : 'stock-warning'}">
                    Current Stock: ${product.stockCount} (Alert threshold: ${product.lowStockAlert})
                  </span>
                </div>
              `).join('')}
            </div>
            
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/products" class="button">Manage Inventory</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} KARIM TRADERS. Admin Alert System</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  outOfStockAlert: (products: Array<{ name: string; sku: string }>) => ({
    subject: '🚨 Out of Stock Alert - KARIM TRADERS',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .product-list { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .product-item { padding: 10px 0; border-bottom: 1px solid #eee; }
          .product-item:last-child { border-bottom: none; }
          .button { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Out of Stock Alert</h1>
          </div>
          <div class="content">
            <p>The following products are now OUT OF STOCK:</p>
            
            <div class="product-list">
              ${products.map(product => `
                <div class="product-item">
                  <strong>${product.name}</strong><br>
                  <span>SKU: ${product.sku}</span>
                </div>
              `).join('')}
            </div>
            
            <p>Please restock these items as soon as possible to avoid losing sales.</p>
            
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/products" class="button">Update Inventory</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} KARIM TRADERS. Admin Alert System</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  deliveryAssignment: (order: any, deliveryPerson: { name: string; phone: string }) => ({
    subject: `New Delivery Assignment - Order #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .button { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Delivery Assignment</h1>
          </div>
          <div class="content">
            <p>Hi ${deliveryPerson.name},</p>
            <p>You have been assigned a new delivery:</p>
            
            <div class="details">
              <h3>Order #${order.orderNumber}</h3>
              <p><strong>Customer:</strong> ${order.address?.name}</p>
              <p><strong>Phone:</strong> ${order.address?.phone}</p>
              <p><strong>Address:</strong><br>
                ${order.address?.addressLine1}<br>
                ${order.address?.addressLine2 ? order.address.addressLine2 + '<br>' : ''}
                ${order.address?.city}, ${order.address?.state} - ${order.address?.pincode}
              </p>
              ${order.address?.landmark ? `<p><strong>Landmark:</strong> ${order.address.landmark}</p>` : ''}
              <p><strong>Payment:</strong> ${order.paymentMethod} - ${order.paymentStatus === 'PAID' ? 'Already Paid' : 'Collect ₹' + order.total}</p>
            </div>
            
            <p>Please deliver this order promptly and update the status once delivered.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} KARIM TRADERS. Delivery Team</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// Password Reset Email Generator
export function generatePasswordResetEmail(name: string, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #22c55e; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #22c55e; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .button:hover { background: #16a34a; }
        .warning { background: #fef3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f0f0f0; border-radius: 0 0 8px 8px; }
        .link-text { word-break: break-all; font-size: 12px; color: #666; background: #e9e9e9; padding: 10px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>We received a request to reset your password for your KARIM TRADERS account. Click the button below to set a new password:</p>
          
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul style="margin: 10px 0 0; padding-left: 20px;">
              <li>This link will expire in <strong>1 hour</strong></li>
              <li>If you didn't request this, please ignore this email</li>
              <li>Your password won't change until you create a new one</li>
            </ul>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p class="link-text">${resetUrl}</p>
          
          <p>If you didn't request a password reset, please contact our support team immediately.</p>
          
          <p>Best regards,<br>The KARIM TRADERS Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} KARIM TRADERS. All rights reserved.</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
