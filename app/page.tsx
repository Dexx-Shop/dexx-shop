import HeroSection from 'components/hero/HeroSection';
import { CometCard } from "components/ui/comet-card";
import { LayoutTextFlip } from "components/ui/layout-text-flip";
import { getProducts } from 'lib/products';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="bg-black text-[#ededed] min-h-screen selection:bg-red-600 selection:text-white pt-4">
      {/* Hero Alanı */}
      <HeroSection />

      {/* Ürün Kataloğu */}
      <main id="products" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.06]">
        {/* BAŞLIK VE FLIP ANİMASYONU */}
        <div className="flex flex-col items-center justify-center text-center mb-16 select-none relative">
          <LayoutTextFlip
            text="Mevcut"
            words={["Ürünler", "Hileler", "Spooferlar"]}
            duration={2500}
          />

          {/* YAZIDAN BİRAZ UZUN İNCE NEON ÇİZGİ */}
          <div className="relative w-64 sm:w-80 h-[2px] mt-5">
            {/* Arkadaki hafif ışıma */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600 to-transparent h-full w-full blur-[2px]" />
            {/* Asıl net ince çizgi */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500 to-transparent h-px w-full" />
          </div>

          <p className="mt-4 text-sm sm:text-base text-neutral-400 max-w-lg">
            
          </p>
        </div>

        {/* 3D COMET ÜRÜN KARTLARI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const productSlug = (product as any).handle || product.id;
            const startPrice =
              product.pricing?.daily ||
              product.pricing?.weekly ||
              product.pricing?.monthly ||
              0;

            return (
              <CometCard key={product.id} className="w-full">
                <Link
                  href={`/product/${productSlug}`}
                  className="group relative bg-[#0e0e11] hover:bg-[#131317] border border-white/[0.08] hover:border-red-600/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-2xl block h-full"
                >
                  {/* Kart Görsel Alanı */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-950">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">
                        Görsel Yok
                      </div>
                    )}
                    
                    {/* Oyun Rozeti */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-black/80 border border-white/10 text-neutral-200 backdrop-blur-md">
                        {product.game || 'DEXX'}
                      </span>
                    </div>

                    {/* Gradient Karartma */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-transparent to-transparent opacity-80" />
                  </div>

                  {/* Kart Detay Alanı */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-white tracking-tight group-hover:text-red-500 transition-colors">
                          {product.title}
                        </h3>
                        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {product.securityTag || 'Undetected'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed font-medium">
                        {product.description}
                      </p>
                    </div>

                    {/* Fiyat & İncele Butonu */}
                    <div className="pt-3.5 border-t border-white/[0.06] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold block">
                          Başlangıç
                        </span>
                        <span className="text-base font-black text-white tracking-tight">
                          ${Number(startPrice).toFixed(2)}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-neutral-300 group-hover:text-red-400 group-hover:translate-x-1 transition-all flex items-center gap-1">
                        <span>İncele</span>
                        <span>→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </CometCard>
            );
          })}
        </div>
      </main>
    </div>
  );
}