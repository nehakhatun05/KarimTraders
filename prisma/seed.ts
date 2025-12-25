import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@karimtraders.com' },
    update: {},
    create: {
      email: 'admin@karimtraders.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      emailVerified: new Date(),
      phone: '9876543210',
      wallet: {
        create: { balance: 0 },
      },
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create test user
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Test User',
      password: userPassword,
      role: 'CUSTOMER',
      emailVerified: new Date(),
      phone: '9876543211',
      wallet: {
        create: { balance: 500 },
      },
    },
  });
  console.log('✅ Test user created:', user.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'fruits' },
      update: {},
      create: {
        name: 'Fresh Fruits',
        slug: 'fruits',
        description: 'Farm-fresh fruits delivered to your doorstep',
        image: '/images/categories/fruits.jpg',
        icon: '🍎',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'vegetables' },
      update: {},
      create: {
        name: 'Fresh Vegetables',
        slug: 'vegetables',
        description: 'Organic and fresh vegetables',
        image: '/images/categories/vegetables.jpg',
        icon: '🥬',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'dry-fruits' },
      update: {},
      create: {
        name: 'Dry Fruits & Nuts',
        slug: 'dry-fruits',
        description: 'Premium quality dry fruits and nuts',
        image: '/images/categories/dry-fruits.jpg',
        icon: '🥜',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'spices' },
      update: {},
      create: {
        name: 'Spices & Seasonings',
        slug: 'spices',
        description: 'Authentic Indian spices and seasonings',
        image: '/images/categories/spices.jpg',
        icon: '🌶️',
      },
    }),
  ]);
  console.log('✅ Categories created:', categories.length);

  // Create products
  const products = [
    {
      name: 'Fresh Red Apples',
      slug: 'fresh-red-apples',
      description: 'Crisp and juicy red apples from Himachal Pradesh. Rich in fiber and antioxidants.',
      shortDescription: 'Crisp and juicy red apples',
      price: 149,
      originalPrice: 180,
      unit: '1 kg',
      stockCount: 100,
      categorySlug: 'fruits',
      featured: true,
      tags: ['apple', 'fruit', 'fresh', 'healthy'],
    },
    {
      name: 'Organic Bananas',
      slug: 'organic-bananas',
      description: 'Naturally ripened organic bananas. Great source of potassium and energy.',
      shortDescription: 'Naturally ripened organic bananas',
      price: 49,
      originalPrice: 60,
      unit: '1 dozen',
      stockCount: 150,
      categorySlug: 'fruits',
      featured: true,
      tags: ['banana', 'fruit', 'organic', 'healthy'],
    },
    {
      name: 'Fresh Mangoes',
      slug: 'fresh-alphonso-mangoes',
      description: 'Premium Alphonso mangoes from Ratnagiri. Sweet and aromatic.',
      shortDescription: 'Premium Alphonso mangoes',
      price: 299,
      originalPrice: 350,
      unit: '1 kg',
      stockCount: 50,
      categorySlug: 'fruits',
      featured: true,
      tags: ['mango', 'alphonso', 'fruit', 'seasonal'],
    },
    {
      name: 'Fresh Spinach',
      slug: 'fresh-spinach',
      description: 'Fresh and tender spinach leaves. Rich in iron and vitamins.',
      shortDescription: 'Fresh and tender spinach',
      price: 35,
      originalPrice: 45,
      unit: '500 gm',
      stockCount: 80,
      categorySlug: 'vegetables',
      featured: false,
      tags: ['spinach', 'vegetable', 'green', 'healthy'],
    },
    {
      name: 'Fresh Tomatoes',
      slug: 'fresh-tomatoes',
      description: 'Farm-fresh red tomatoes. Perfect for salads and cooking.',
      shortDescription: 'Farm-fresh red tomatoes',
      price: 45,
      originalPrice: 55,
      unit: '1 kg',
      stockCount: 200,
      categorySlug: 'vegetables',
      featured: true,
      tags: ['tomato', 'vegetable', 'fresh'],
    },
    {
      name: 'Premium Almonds',
      slug: 'premium-almonds',
      description: 'California almonds, premium quality. Rich in protein and healthy fats.',
      shortDescription: 'Premium California almonds',
      price: 599,
      originalPrice: 750,
      unit: '500 gm',
      stockCount: 60,
      categorySlug: 'dry-fruits',
      featured: true,
      tags: ['almond', 'dry-fruit', 'nut', 'healthy'],
    },
    {
      name: 'Cashew Nuts',
      slug: 'cashew-nuts',
      description: 'Premium whole cashew nuts. Crunchy and delicious.',
      shortDescription: 'Premium whole cashews',
      price: 699,
      originalPrice: 850,
      unit: '500 gm',
      stockCount: 45,
      categorySlug: 'dry-fruits',
      featured: true,
      tags: ['cashew', 'dry-fruit', 'nut'],
    },
    {
      name: 'Turmeric Powder',
      slug: 'turmeric-powder',
      description: 'Pure turmeric powder from Sangli. No artificial colors.',
      shortDescription: 'Pure turmeric powder',
      price: 89,
      originalPrice: 120,
      unit: '200 gm',
      stockCount: 100,
      categorySlug: 'spices',
      featured: false,
      tags: ['turmeric', 'spice', 'masala', 'pure'],
    },
    {
      name: 'Red Chilli Powder',
      slug: 'red-chilli-powder',
      description: 'Premium Guntur red chilli powder. Authentic spicy flavor.',
      shortDescription: 'Premium red chilli powder',
      price: 119,
      originalPrice: 150,
      unit: '200 gm',
      stockCount: 90,
      categorySlug: 'spices',
      featured: false,
      tags: ['chilli', 'spice', 'masala', 'hot'],
    },
    {
      name: 'Garam Masala',
      slug: 'garam-masala',
      description: 'Homemade garam masala blend. Perfect for curries and biryanis.',
      shortDescription: 'Homemade garam masala blend',
      price: 149,
      originalPrice: 180,
      unit: '100 gm',
      stockCount: 70,
      categorySlug: 'spices',
      featured: true,
      tags: ['garam-masala', 'spice', 'masala', 'blend'],
    },
  ];

  for (const productData of products) {
    const category = await prisma.category.findUnique({
      where: { slug: productData.categorySlug },
    });

    if (category) {
      await prisma.product.upsert({
        where: { slug: productData.slug },
        update: {},
        create: {
          name: productData.name,
          slug: productData.slug,
          sku: `SKU-${productData.slug.toUpperCase().replace(/-/g, '')}`,
          description: productData.description,
          shortDescription: productData.shortDescription,
          price: productData.price,
          originalPrice: productData.originalPrice,
          unit: productData.unit,
          stockCount: productData.stockCount,
          stockStatus: productData.stockCount > 10 ? 'IN_STOCK' : 'LOW_STOCK',
          categoryId: category.id,
          featured: productData.featured,
          tags: productData.tags,
          images: {
            create: {
              url: `/images/products/${productData.slug}.jpg`,
              alt: productData.name,
              isPrimary: true,
            },
          },
        },
      });
    }
  }
  console.log('✅ Products created:', products.length);

  // Create coupons
  const coupons = await Promise.all([
    prisma.coupon.upsert({
      where: { code: 'WELCOME10' },
      update: {},
      create: {
        code: 'WELCOME10',
        type: 'PERCENTAGE',
        value: 10,
        description: '10% off on your first order',
        minOrderAmount: 299,
        maxDiscount: 100,
        usageLimit: 1000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    }),
    prisma.coupon.upsert({
      where: { code: 'FLAT50' },
      update: {},
      create: {
        code: 'FLAT50',
        type: 'FIXED',
        value: 50,
        description: '₹50 off on orders above ₹499',
        minOrderAmount: 499,
        usageLimit: 500,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    }),
    prisma.coupon.upsert({
      where: { code: 'FRESH20' },
      update: {},
      create: {
        code: 'FRESH20',
        type: 'PERCENTAGE',
        value: 20,
        description: '20% off on fresh produce',
        minOrderAmount: 199,
        maxDiscount: 150,
        usageLimit: 200,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    }),
  ]);
  console.log('✅ Coupons created:', coupons.length);

  // Create delivery slots (using findFirst/create pattern for MongoDB)
  const deliverySlotsData = [
    { name: 'Morning', startTime: '06:00', endTime: '09:00', cutoffTime: '21:00', isActive: true, maxOrders: 50 },
    { name: 'Afternoon', startTime: '12:00', endTime: '15:00', cutoffTime: '08:00', isActive: true, maxOrders: 50 },
    { name: 'Evening', startTime: '17:00', endTime: '20:00', cutoffTime: '12:00', isActive: true, maxOrders: 50 },
  ];

  for (const slotData of deliverySlotsData) {
    const existing = await prisma.deliverySlot.findFirst({ where: { name: slotData.name } });
    if (!existing) {
      await prisma.deliverySlot.create({ data: slotData });
    }
  }
  console.log('✅ Delivery slots created:', deliverySlotsData.length);

  // Create banners (using findFirst/create pattern for MongoDB)
  const bannersData = [
    { title: 'Fresh Fruits Sale', subtitle: 'Up to 30% off on all fresh fruits', image: '/images/banners/fruits-sale.jpg', link: '/products?category=fruits', isActive: true, sortOrder: 1 },
    { title: 'Premium Dry Fruits', subtitle: 'Best quality at best prices', image: '/images/banners/dry-fruits.jpg', link: '/products?category=dry-fruits', isActive: true, sortOrder: 2 },
    { title: 'Free Delivery', subtitle: 'On orders above ₹499', image: '/images/banners/free-delivery.jpg', link: '/products', isActive: true, sortOrder: 3 },
  ];

  for (const bannerData of bannersData) {
    const existing = await prisma.banner.findFirst({ where: { title: bannerData.title } });
    if (!existing) {
      await prisma.banner.create({ data: bannerData });
    }
  }
  console.log('✅ Banners created:', bannersData.length);

  // Create sample notifications for test user
  const notificationsData = [
    {
      type: 'PROMOTION' as const,
      title: '🎉 Welcome to KARIM TRADERS!',
      message: 'Thank you for joining us. Use code WELCOME10 to get 10% off on your first order!',
      isRead: false,
      userId: user.id,
    },
    {
      type: 'PROMOTION' as const,
      title: '🔥 Flash Sale Alert!',
      message: 'Fresh fruits at 40% off! Limited time offer. Hurry up!',
      isRead: false,
      data: { promoLink: '/products?category=cat-1&offers=true' },
      userId: user.id,
    },
    {
      type: 'SYSTEM' as const,
      title: '📍 Delivery Available',
      message: 'Great news! We now deliver to your area. Enjoy fresh groceries at your doorstep.',
      isRead: true,
      userId: user.id,
    },
    {
      type: 'WALLET' as const,
      title: '💰 Cashback Credited!',
      message: 'Congratulations! ₹50 cashback has been credited to your wallet.',
      isRead: false,
      data: { amount: 50 },
      userId: user.id,
    },
    {
      type: 'PROMOTION' as const,
      title: '🥜 Dry Fruits Festival',
      message: 'Premium almonds, cashews & more at unbeatable prices. Shop now!',
      isRead: true,
      data: { promoLink: '/products?category=cat-3' },
      userId: user.id,
    },
  ];

  // Delete existing notifications for user and create new ones
  await prisma.notification.deleteMany({ where: { userId: user.id } });
  for (const notificationData of notificationsData) {
    await prisma.notification.create({ data: notificationData });
  }
  console.log('✅ Notifications created:', notificationsData.length);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
