import HeroSection from 'components/hero/HeroSection';
import { getProducts } from 'lib/products';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="bg-[#080809] text-[#ededed] min-h-screen selection:bg-white selection:text-black pt-4">
      {/* Hero Alanı */}
      <HeroSection />

      {/* Ürün Kataloğu */}
      <main id="products" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.06]">
        <div className="flex items-baseline justify-between mb-10">
          <div>
            <h2 className="text-xl font-medium tracking-tight text-white">
              Mevcut Ürünler
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Kernel düzeyinde donanım korumalı yazılımlar.
            </p>
          </div>
          <span className="text-xs text-neutral-500 font-normal">
            {products.length} Aktif Ürün
          </span>
        </div>

        {/* Soğuk & Mat Cam Kartlar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product) => {
            const productSlug = (product as any).handle || product.id;
            const startPrice =
              product.pricing?.daily ||
              product.pricing?.weekly ||
              product.pricing?.monthly ||
              0;

            return (
              <Link
                key={product.id}
                href={`/product/${productSlug}`}
                className="group relative bg-[#0e0e11] hover:bg-[#131317] border border-white/[0.06] hover:border-white/[0.14] rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-950">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">
                      Görsel Yok
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-normal tracking-tight px-2.5 py-0.5 rounded-full bg-black/70 border border-white/[0.08] text-neutral-300 backdrop-blur-md">
                      {product.game || 'DEXX'}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-medium text-white tracking-tight group-hover:text-neutral-200 transition-colors">
                        {product.title}
                      </h3>
                      <span className="text-[11px] text-emerald-400 font-normal">
                        {product.securityTag || 'Aktif'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed font-normal">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-white/[0.06] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-500 block">Başlangıç</span>
                      <span className="text-sm font-medium text-white tracking-tight">
                        ${Number(startPrice).toFixed(2)}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-400 group-hover:text-white transition flex items-center gap-1 font-normal">
                      <span>İncele</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}