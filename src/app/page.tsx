import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import ProductSection from '@/components/home/ProductSection';
import DealsSection from '@/components/home/DealsSection';
import ShopByConcern from '@/components/home/ShopByConcern';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import CategoryPills from '@/components/home/CategoryPills';
import PromoBannerStrip from '@/components/home/PromoBannerStrip';
import TrustBadges from '@/components/home/TrustBadges';
import prisma from '@/lib/prisma';

// Fetch products from database
async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });
    return products.map(formatProduct);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

async function getBestSellers() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isBestSeller: true,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });
    return products.map(formatProduct);
  } catch (error) {
    console.error('Error fetching best sellers:', error);
    return [];
  }
}

async function getNewArrivals() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isNew: true,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });
    return products.map(formatProduct);
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    return [];
  }
}

// Format product for ProductSection component
function formatProduct(product: any) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.price),
    originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
    discount: product.discount || 0,
    image: product.images?.[0]?.url || '/images/placeholder-product.png',
    category: product.category?.name || 'Uncategorized',
    unit: product.unit || '1 kg',
    rating: product.rating || 0,
    reviewCount: product.reviewCount || 0,
    isOrganic: product.isOrganic || false,
    isBestSeller: product.isBestSeller || false,
    isNew: product.isNew || false,
    stock: product.stockStatus === 'OUT_OF_STOCK' ? 0 : product.stockCount,
  };
}

export default async function Home() {
  const [featuredProducts, bestSellers, newArrivals] = await Promise.all([
    getFeaturedProducts(),
    getBestSellers(),
    getNewArrivals(),
  ]);

  return (
    <>
      {/* Promo Banner Strip */}
      <PromoBannerStrip />

      {/* Category Pills - Quick Navigation */}
      <CategoryPills />

      {/* Hero Banner */}
      <HeroSection />

      {/* Categories */}
      <CategorySection />

      {/* Featured Products */}
      <ProductSection
        title="Featured Products"
        subtitle="Handpicked products just for you"
        products={featuredProducts}
        viewAllLink="/products?featured=true"
      />

      {/* Flash Deals */}
      <DealsSection />

      {/* Best Sellers */}
      <ProductSection
        title="Best Sellers"
        subtitle="Our most popular products"
        products={bestSellers}
        viewAllLink="/products?bestseller=true"
        bgColor="bg-gray-50"
      />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Shop by Concern */}
      <ShopByConcern />

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <ProductSection
          title="New Arrivals"
          subtitle="Fresh additions to our collection"
          products={newArrivals}
          viewAllLink="/products?new=true"
          bgColor="bg-gray-50"
        />
      )}

      {/* Testimonials */}
      <TestimonialsSection />

      {/* App Download Banner */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">
                Download Our App
              </h2>
              <p className="text-white/90 mb-6 max-w-lg">
                Get exclusive app-only offers, easier ordering, and track your deliveries in real-time. 
                Download now and get ₹100 off on your first order!
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-3 hover:bg-gray-800 transition-colors">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-xs opacity-80">Download on the</p>
                    <p className="font-semibold">App Store</p>
                  </div>
                </button>
                <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-3 hover:bg-gray-800 transition-colors">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-xs opacity-80">Get it on</p>
                    <p className="font-semibold">Google Play</p>
                  </div>
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="w-64 h-auto">
                <img
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=600&fit=crop"
                  alt="Mobile App"
                  className="rounded-3xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
