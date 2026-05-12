import HeroBanner from '@/components/home/HeroBanner';
import PromoBanners from '@/components/home/PromoBanners';
import ProductGrid from '@/components/home/ProductGrid';
import CategoryCards from '@/components/home/CategoryCards';
import TrustBadges from '@/components/home/TrustBadges';
import Newsletter from '@/components/home/Newsletter';

export default function Home() {
  return (
    <>
      <HeroBanner />
      <TrustBadges />
      <PromoBanners />
      <ProductGrid title="Productos Destacados" variant="featured" />
      <CategoryCards />
      <ProductGrid title="Nuevas Llegadas" variant="new" />
      <Newsletter />
    </>
  );
}
