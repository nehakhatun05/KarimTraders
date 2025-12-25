"use strict";exports.id=127,exports.ids=[127],exports.modules={81826:(e,t,o)=>{o.d(t,{Cz:()=>a,jZ:()=>n,vl:()=>d});let r=o(68140).createTransport({host:process.env.SMTP_HOST,port:parseInt(process.env.SMTP_PORT||"587"),secure:"465"===process.env.SMTP_PORT,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}});async function a(e){try{let t=await r.sendMail({from:`"KARIM TRADERS" <${process.env.EMAIL_FROM}>`,to:e.to,subject:e.subject,text:e.text,html:e.html});return console.log("Email sent:",t.messageId),{success:!0,messageId:t.messageId}}catch(e){return console.error("Email send error:",e),{success:!1,error:e}}}let d={welcome:e=>({subject:"Welcome to KARIM TRADERS!",html:`
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
            <p>Hi ${e},</p>
            <p>Thank you for creating an account with KARIM TRADERS. We're excited to have you on board!</p>
            <p>Start exploring our wide range of fresh groceries:</p>
            <ul>
              <li>🍎 Fresh Fruits</li>
              <li>🥬 Fresh Vegetables</li>
              <li>🥜 Premium Dry Fruits</li>
              <li>🌶️ Authentic Spices</li>
            </ul>
            <p style="text-align: center;">
              <a href="http://localhost:3000/products" class="button">Start Shopping</a>
            </p>
          </div>
          <div class="footer">
            <p>\xa9 ${new Date().getFullYear()} KARIM TRADERS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `}),orderConfirmation:e=>({subject:`Order Confirmed - #${e.orderNumber}`,html:`
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
            <p>Hi ${e.user?.name||"Customer"},</p>
            <p>Thank you for your order! We've received your order and it's being processed.</p>
            
            <div class="order-details">
              <h3>Order #${e.orderNumber}</h3>
              <p>Placed on: ${new Date(e.createdAt).toLocaleDateString("en-IN",{dateStyle:"long"})}</p>
              
              <h4>Items:</h4>
              ${e.items.map(e=>`
                <div class="item">
                  <span>${e.name} \xd7 ${e.quantity}</span>
                  <span>₹${(e.price*e.quantity).toFixed(2)}</span>
                </div>
              `).join("")}
              
              <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #22c55e;">
                <div class="item">
                  <span>Subtotal</span>
                  <span>₹${e.subtotal.toFixed(2)}</span>
                </div>
                ${e.discount>0?`
                <div class="item">
                  <span>Discount</span>
                  <span>-₹${e.discount.toFixed(2)}</span>
                </div>
                `:""}
                <div class="item">
                  <span>Delivery Fee</span>
                  <span>${e.deliveryFee>0?`₹${e.deliveryFee.toFixed(2)}`:"FREE"}</span>
                </div>
                <div class="item total">
                  <span>Total</span>
                  <span>₹${e.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <h4>Delivery Address:</h4>
            <p>
              ${e.address?.name}<br>
              ${e.address?.addressLine1}<br>
              ${e.address?.addressLine2?e.address.addressLine2+"<br>":""}
              ${e.address?.city}, ${e.address?.state} - ${e.address?.pincode}
            </p>
            
            <p style="text-align: center;">
              <a href="http://localhost:3000/account/orders/${e.id}" class="button">Track Order</a>
            </p>
          </div>
          <div class="footer">
            <p>\xa9 ${new Date().getFullYear()} KARIM TRADERS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `}),orderStatusUpdate:(e,t,o)=>({subject:`Order Update - #${e.orderNumber}`,html:`
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
            <p>Hi ${e.user?.name||"Customer"},</p>
            <p>Your order #${e.orderNumber} has been updated:</p>
            
            <p style="text-align: center; margin: 20px 0;">
              <span class="status-badge">${t.replace(/_/g," ")}</span>
            </p>
            
            <p>${o}</p>
            
            <p style="text-align: center;">
              <a href="http://localhost:3000/account/orders/${e.id}" class="button">View Order Details</a>
            </p>
          </div>
          <div class="footer">
            <p>\xa9 ${new Date().getFullYear()} KARIM TRADERS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `}),passwordReset:(e,t)=>({subject:"Reset Your Password - KARIM TRADERS",html:`
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
            <p>Hi ${e},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${t}" class="button">Reset Password</a>
            </p>
            
            <p>If you didn't request this, you can safely ignore this email. Your password won't be changed.</p>
            <p>This link will expire in 1 hour.</p>
          </div>
          <div class="footer">
            <p>\xa9 ${new Date().getFullYear()} KARIM TRADERS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `}),lowStockAlert:e=>({subject:"⚠️ Low Stock Alert - KARIM TRADERS",html:`
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
              ${e.map(e=>`
                <div class="product-item">
                  <strong>${e.name}</strong><br>
                  <span>SKU: ${e.sku}</span><br>
                  <span class="${e.stockCount<=5?"stock-critical":"stock-warning"}">
                    Current Stock: ${e.stockCount} (Alert threshold: ${e.lowStockAlert})
                  </span>
                </div>
              `).join("")}
            </div>
            
            <p style="text-align: center;">
              <a href="http://localhost:3000/admin/products" class="button">Manage Inventory</a>
            </p>
          </div>
          <div class="footer">
            <p>\xa9 ${new Date().getFullYear()} KARIM TRADERS. Admin Alert System</p>
          </div>
        </div>
      </body>
      </html>
    `}),outOfStockAlert:e=>({subject:"\uD83D\uDEA8 Out of Stock Alert - KARIM TRADERS",html:`
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
              ${e.map(e=>`
                <div class="product-item">
                  <strong>${e.name}</strong><br>
                  <span>SKU: ${e.sku}</span>
                </div>
              `).join("")}
            </div>
            
            <p>Please restock these items as soon as possible to avoid losing sales.</p>
            
            <p style="text-align: center;">
              <a href="http://localhost:3000/admin/products" class="button">Update Inventory</a>
            </p>
          </div>
          <div class="footer">
            <p>\xa9 ${new Date().getFullYear()} KARIM TRADERS. Admin Alert System</p>
          </div>
        </div>
      </body>
      </html>
    `}),deliveryAssignment:(e,t)=>({subject:`New Delivery Assignment - Order #${e.orderNumber}`,html:`
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
            <p>Hi ${t.name},</p>
            <p>You have been assigned a new delivery:</p>
            
            <div class="details">
              <h3>Order #${e.orderNumber}</h3>
              <p><strong>Customer:</strong> ${e.address?.name}</p>
              <p><strong>Phone:</strong> ${e.address?.phone}</p>
              <p><strong>Address:</strong><br>
                ${e.address?.addressLine1}<br>
                ${e.address?.addressLine2?e.address.addressLine2+"<br>":""}
                ${e.address?.city}, ${e.address?.state} - ${e.address?.pincode}
              </p>
              ${e.address?.landmark?`<p><strong>Landmark:</strong> ${e.address.landmark}</p>`:""}
              <p><strong>Payment:</strong> ${e.paymentMethod} - ${"PAID"===e.paymentStatus?"Already Paid":"Collect ₹"+e.total}</p>
            </div>
            
            <p>Please deliver this order promptly and update the status once delivered.</p>
          </div>
          <div class="footer">
            <p>\xa9 ${new Date().getFullYear()} KARIM TRADERS. Delivery Team</p>
          </div>
        </div>
      </body>
      </html>
    `})};function n(e,t){return`
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
          <p>Hi ${e},</p>
          <p>We received a request to reset your password for your KARIM TRADERS account. Click the button below to set a new password:</p>
          
          <p style="text-align: center;">
            <a href="${t}" class="button">Reset Password</a>
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
          <p class="link-text">${t}</p>
          
          <p>If you didn't request a password reset, please contact our support team immediately.</p>
          
          <p>Best regards,<br>The KARIM TRADERS Team</p>
        </div>
        <div class="footer">
          <p>\xa9 ${new Date().getFullYear()} KARIM TRADERS. All rights reserved.</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `}},34490:(e,t,o)=>{o.d(t,{Z:()=>d,_:()=>a});var r=o(53524);let a=globalThis.prisma??new r.PrismaClient({log:["error"]}),d=a}};