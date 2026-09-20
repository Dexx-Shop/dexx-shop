import { getProducts } from 'lib/products';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const decodedGame = slug.toUpperCase();

  const allProducts = await getProducts();
  const categoryProducts = allProducts.filter(
    (p) => (p.game || '').toUpperCase() === decodedGame
  );

  if (categoryProducts.length === 0 && decodedGame !== 'RUST' && decodedGame !== 'FIVEM') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white pb-24 px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Breadcrumb & Geri Dönüş */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium">
            <Link href="/" className="hover:text-white transition">Anasayfa</Link>
            <span>/</span>
            <span className="text-red-500 font-bold uppercase">{decodedGame} Ürünleri</span>
          </div>

          <Link
            href="/#products"
            className="text-xs px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 transition"
          >
            ← Tüm Kategoriler
          </Link>
        </div>

        {/* Kategori Başlık Başlığı */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/80 text-red-400 text-[11px] font-bold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>Kategori Vitrini</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
            {decodedGame} <span className="text-red-600">Yazılımları</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            {decodedGame} için optimize edilmiş, güncel ve undetected modlar listelenmektedir.
          </p>
        </div>

        {/* Ürün Listesi Grid */}
        {categoryProducts.length === 0 ? (
          <div className="text-center py-20 bg-neutral-950/60 border border-neutral-800 rounded-3xl backdrop-blur-md space-y-3">
            <span className="text-4xl block">📦</span>
            <p className="text-neutral-400 text-sm">Bu kategoride henüz aktif ürün bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryProducts.map((product) => {
              const minPrice = product.pricing?.daily || product.pricing?.weekly || product.pricing?.monthly || 0;
              const isSafe = product.status === 'active';
              const isUpdating = product.status === 'updating';

              return (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group bg-neutral-950/80 border border-neutral-800/80 hover:border-red-600/60 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    {/* Görsel Alanı */}
                    <div className="relative aspect-video w-full overflow-hidden bg-black">
                      <img
                        src={product.image || 'https://via.placeholder.com/400x225'}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                      
                      {/* Oyun Etiketi */}
                      <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-black/70 border border-white/10 text-white backdrop-blur-md">
                        {product.game}
                      </span>

                      {/* Durum Rozeti */}
                      <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        isSafe
                          ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
                          : isUpdating
                          ? 'bg-amber-950/80 border-amber-800 text-amber-400'
                          : 'bg-red-950/80 border-red-800 text-red-400'
                      }`}>
                        {isSafe ? '● Undetected' : isUpdating ? '● Güncelleniyor' : '● Bakımda'}
                      </span>
                    </div>

                    {/* Başlık & Açıklama */}
                    <div className="p-5 space-y-2">
                      <h3 className="font-extrabold text-base text-white group-hover:text-red-500 transition line-clamp-1">
                        {product.title}
                      </h3>
                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {product.description || 'Detaylı mod açıklaması için tıklayın.'}
                      </p>
                    </div>
                  </div>

                  {/* Alt Fiyat ve İncele Alanı */}
                  <div className="p-5 pt-0 flex items-center justify-between border-t border-neutral-900 mt-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">Başlangıç</span>
                      <span className="text-base font-black text-white font-mono">${minPrice} <span className="text-[11px] text-neutral-400 font-normal">USD</span></span>
                    </div>

                    <span className="text-xs font-bold px-3.5 py-2 rounded-xl bg-red-600/10 text-red-400 border border-red-900/40 group-hover:bg-red-600 group-hover:text-white transition">
                      İncele →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}