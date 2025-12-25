# KARIM TRADERS - E-Commerce Grocery Platform

A full-featured e-commerce grocery shopping platform built with Next.js 14, featuring real-time order tracking, multiple payment gateways, and a comprehensive admin panel.

## 🚀 Features

### Customer Features
- **User Authentication**: Email/password and Google OAuth login
- **Product Browsing**: Search, filter, sort by categories
- **Shopping Cart**: Persistent cart with quantity management
- **Wishlist**: Save favorite products
- **Checkout**: Multiple payment options (Razorpay, Stripe, COD)
- **Order Tracking**: Real-time order status with WebSocket updates
- **Wallet System**: Digital wallet with transaction history
- **Address Management**: Save multiple delivery addresses
- **Reviews & Ratings**: Rate and review products
- **Notifications**: Real-time notifications via WebSocket

### Admin Features
- **Dashboard**: Analytics, revenue, order statistics
- **Order Management**: View, update, track all orders
- **User Management**: View and manage customers
- **Product Management**: CRUD operations for products
- **Category Management**: Organize products by categories
- **Banner Management**: Promotional banners
- **Coupon System**: Create discount coupons

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MongoDB Atlas
- **Authentication**: NextAuth.js
- **Payments**: Razorpay, Stripe
- **Real-time**: Socket.io WebSockets
- **Email**: Nodemailer
- **State Management**: Zustand
- **Validation**: Zod

## 📦 Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (free tier available)
- npm/yarn/pnpm

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
cd karim123
npm install
```

### 2. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a new cluster (free M0 tier works fine)
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Add your database name (e.g., `karim_traders`)

### 3. Configure Environment

Update `.env` with your MongoDB Atlas connection string:

```env
# Database (MongoDB Atlas)
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/karim_traders?retryWrites=true&w=majority"

# NextAuth - Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Razorpay (for payments)
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
RAZORPAY_WEBHOOK_SECRET=""

# Stripe (alternative payment)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# Email (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="KARIM TRADERS <noreply@karimtraders.com>"
```

### 4. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to MongoDB (creates collections)
npx prisma db push

# Seed database with sample data
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 📁 Project Structure

```
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Sample data
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   │   ├── admin/      # Admin APIs
│   │   │   ├── auth/       # Auth APIs
│   │   │   ├── cart/       # Cart APIs
│   │   │   ├── orders/     # Order APIs
│   │   │   ├── payments/   # Payment APIs
│   │   │   ├── products/   # Product APIs
│   │   │   ├── user/       # User profile APIs
│   │   │   └── webhooks/   # Payment webhooks
│   │   ├── admin/          # Admin pages
│   │   ├── account/        # User account pages
│   │   └── ...             # Other pages
│   ├── components/         # React components
│   ├── lib/                # Utility libraries
│   │   ├── auth.ts         # NextAuth config
│   │   ├── prisma.ts       # Prisma client
│   │   ├── socket.ts       # WebSocket setup
│   │   ├── email.ts        # Email service
│   │   └── api/            # API client & hooks
│   ├── store/              # Zustand stores
│   └── types/              # TypeScript types
├── middleware.ts           # Route protection
└── docker-compose.yml      # Database container
```

## 🔐 Default Accounts

After seeding, these accounts are available:

| Role       | Email                    | Password  |
|------------|--------------------------|-----------|
| Admin      | admin@karimtraders.com   | admin123  |
| Customer   | john@example.com         | password123|
| Customer   | jane@example.com         | password123|

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/[slug]` - Get product details
- `GET /api/categories` - List categories
- `GET /api/search` - Search products

### Cart & Wishlist
- `GET/POST/DELETE /api/cart` - Cart operations
- `GET/POST/DELETE /api/user/wishlist` - Wishlist operations

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - User's orders
- `GET /api/orders/[id]` - Order details

### Payments
- `POST /api/payments` - Create payment order
- `PUT /api/payments` - Verify payment
- `POST /api/webhooks/razorpay` - Razorpay webhook
- `POST /api/webhooks/stripe` - Stripe webhook

### User
- `GET/PUT /api/user/profile` - Profile management
- `GET/POST /api/user/addresses` - Address management
- `GET /api/user/wallet` - Wallet operations
- `GET /api/user/notifications` - Notifications

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET/PUT /api/admin/orders` - Order management
- `GET /api/admin/users` - User management

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t karim-traders .
docker run -p 3000:3000 karim-traders
```

## 🔧 Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Database studio
npx prisma studio

# Reset database
npx prisma migrate reset

# Generate Prisma types
npx prisma generate
```

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Support

For support, email support@karimtraders.com or create an issue.

---

Built with ❤️ by KARIM TRADERS Team
