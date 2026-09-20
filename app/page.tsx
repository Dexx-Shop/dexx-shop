import HeroSection from 'components/hero/HeroSection';
import RelaxBanner from 'components/hero/RelaxBanner';
import { getProducts } from 'lib/products';
import { ProductCatalog } from './product/ProductCatalog';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="bg-black text-[#ededed] min-h-screen selection:bg-red-600 selection:text-white pt-4">
      {/* Hero Alanı */}
      <HeroSection />

      <RelaxBanner />

      {/* Kategorili Ürün Kataloğu */}
      <ProductCatalog products={products || []} />
    </div>
  );
}