import { getCurrentUser } from 'lib/auth';
import { getLowestPrice, getProducts } from 'lib/products';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await getProducts();
  const user = await getCurrentUser();
  const hasAdminAccess = user && (user.role === 'owner' || user.role === 'admin' || user.role === 'moderator');

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-red-600 selection:text-white relative overflow-hidden pb-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-red-600/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Hero Alanı - Kurumsal Oyun İçi Optimizasyon ve Araç Dili */}
      <section className="relative pt-6 sm:pt-10 pb-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 backdrop-blur-md mb-6 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>DexX Software • Yeni Nesil Oyun Eklentileri</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Oyun Deneyiminizi <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-red-600">
            Kişiselleştirin
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed font-normal">
          Gelişmiş arayüz modları, performans optimizasyon araçları ve özel oyun içi eklenti kütüphanemiz ile tanışın.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#products"
            className="px-6 py-3 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-white/10"
          >
            Eklentileri İncele ↓
          </a>
          <Link
            href="/support"
            className="px-6 py-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 font-semibold text-xs sm:text-sm transition-all duration-200"
          >
            Müşteri Desteği
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-xs text-neutral-400">
          <span className="px-3.5 py-1.5 rounded-full bg-neutral-900/60 border border-neutral-800/80">
            ⚡ Anında Dijital Lisans
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-neutral-900/60 border border-neutral-800/80">
            🛡️ %100 Sistem Uyumluluğu
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-neutral-900/60 border border-neutral-800/80">
            🔄 Düzenli Sürüm Güncellemeleri
          </span>
        </div>
      </section>

      {/* Ürün Listesi */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-neutral-800/80 pb-5 mb-8 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Yazılım & Mod Paketleri</span>
              <span className="text-xs font-semibold text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-0.5 rounded-full">
                {products.length}
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Desteklenen sistemleri ve paket ayrıntılarını seçerek lisans oluşturabilirsiniz.
            </p>
          </div>

          {hasAdminAccess && (
            <Link
              href="/admin"
              className="text-xs bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              <span>+</span>
              <span>Mod / Yazılım Yönetimi</span>
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/20 border border-neutral-800/60 rounded-3xl backdrop-blur-md">
            <p className="text-neutral-400 text-sm font-medium">Şu an listelenen mod paketi bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((item) => {
              const lowestPrice = getLowestPrice(item.pricing);

              return (
                <div
                  key={item.id}
                  className="group relative rounded-2xl bg-neutral-900/40 border border-neutral-800/80 hover:border-red-600/50 overflow-hidden transition-all duration-300 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(239,68,68,0.15)] backdrop-blur-md"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-950 border-b border-neutral-800/80">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent"></div>

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="text-[10px] font-extrabold tracking-wider px-2.5 py-1 rounded-md bg-neutral-950/80 border border-neutral-800 text-neutral-200 backdrop-blur-md uppercase">
                        {item.game || 'YAZILIM'}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-md bg-red-950/80 border border-red-800/80 text-red-400">
                        Sürüm Uyumlu
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-bold text-white text-lg group-hover:text-red-400 transition tracking-tight">
                        {item.title}
                      </h3>

                      <div className="mt-2 flex items-center gap-2 text-xs font-medium text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Güncel & Kararlı Sürüm
                      </div>
                    </div>

                    <div className="pt-4 mt-5 border-t border-neutral-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase tracking-wider">Fiyat</span>
                        <span className="text-sm font-black text-white font-mono">
                          Starting at <span className="text-red-500 font-bold">${lowestPrice.toFixed(2)}</span> USD
                        </span>
                      </div>

                      <Link
                        href={`/product/${item.id}`}
                        className="text-xs bg-white hover:bg-neutral-200 text-black font-semibold px-4 py-2 rounded-full transition duration-200 shadow-sm"
                      >
                        İncele →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}