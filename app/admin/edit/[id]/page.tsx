import { getCurrentUser } from 'lib/auth';
import { getProductById } from 'lib/products';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { updateProductAction } from '../../actions';

export default async function EditProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const user = await getCurrentUser();

  if (!user || (user.role !== 'owner' && user.role !== 'admin' && user.role !== 'moderator')) {
    redirect('/');
  }

  const product = await getProductById(id);
  if (!product) redirect('/admin');

  const stock = product.stock || { daily: true, weekly: true, monthly: true, lifetime: true };
  const mediaRawValue = product.media && product.media.length > 0 ? product.media.join('\n') : product.image || '';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-white pb-24">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold">Modu Düzenle</h1>
          <p className="text-xs text-neutral-400 mt-1">Fiyatlar, medya galerisi, video ve mod detaylarını güncelleyin.</p>
        </div>
        <Link
          href="/admin"
          className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-4 py-2 rounded-xl transition"
        >
          ← Panele Dön
        </Link>
      </div>

      <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
        <form action={updateProductAction} className="space-y-6">
          <input type="hidden" name="id" value={product.id} />

          {/* Temel Bilgiler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">Mod Adı</label>
              <input
                name="title"
                defaultValue={product.title}
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">Oyun Kategorisi</label>
              <select
                name="game"
                defaultValue={product.game?.toUpperCase() || 'RUST'}
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm uppercase text-white focus:outline-none focus:border-red-600 cursor-pointer"
              >
                <option value="RUST">RUST</option>
                <option value="FIVEM">FIVEM</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">Güvenlik Etiketi</label>
              <input
                name="securityTag"
                defaultValue={product.securityTag || 'Undetected'}
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          {/* Medya & Video Ayarları */}
          <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-5 space-y-4">
            <span className="text-xs uppercase font-bold text-red-500 tracking-wider block">
              Medya & Tanıtım Galerisi
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
                  Ana Kapak Görseli (URL)
                </label>
                <input
                  name="image"
                  type="url"
                  defaultValue={product.image}
                  required
                  placeholder="https://... (Ana vitrin görseli)"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
                  Tanıtım Videosu (YouTube veya .mp4 linki)
                </label>
                <input
                  name="videoUrl"
                  type="url"
                  defaultValue={product.videoUrl || ''}
                  placeholder="https://www.youtube.com/watch?v=... veya doğrudan .mp4"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
                Çoklu Ek Görseller (Her satıra bir görsel bağlantısı)
              </label>
              <textarea
                name="mediaUrls"
                rows={3}
                defaultValue={mediaRawValue}
                placeholder="https://resim1.png&#10;https://resim2.png"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600 resize-none font-mono"
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Sayfadaki galeri slider'ında bu görseller listelenecektir.
              </p>
            </div>
          </div>

          {/* Lisans Fiyatları, Durum & Stok */}
          <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
              <span className="text-xs uppercase font-bold text-red-500 tracking-wider">
                Lisans Fiyatları & Stok Durumu ($ USD)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Ürün Durumu:</span>
                <select
                  name="status"
                  defaultValue={product.status || 'active'}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-red-600 cursor-pointer font-semibold"
                >
                  <option value="active">🟢 Aktif / Güvenli</option>
                  <option value="updating">🟡 Güncelleniyor</option>
                  <option value="inactive">🔴 Bakımda</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-neutral-900/60 border border-neutral-800 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">1 Günlük</span>
                  <label className="flex items-center gap-1.5 text-[11px] text-neutral-300 cursor-pointer">
                    <input type="checkbox" name="stock_daily" defaultChecked={stock.daily !== false} className="accent-red-600" />
                    <span>Stok Var</span>
                  </label>
                </div>
                <input
                  name="price_daily"
                  type="number"
                  step="0.01"
                  defaultValue={product.pricing?.daily || ''}
                  placeholder="Fiyat ($)"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-sm text-red-400 font-mono focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="bg-neutral-900/60 border border-neutral-800 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">1 Haftalık</span>
                  <label className="flex items-center gap-1.5 text-[11px] text-neutral-300 cursor-pointer">
                    <input type="checkbox" name="stock_weekly" defaultChecked={stock.weekly !== false} className="accent-red-600" />
                    <span>Stok Var</span>
                  </label>
                </div>
                <input
                  name="price_weekly"
                  type="number"
                  step="0.01"
                  defaultValue={product.pricing?.weekly || ''}
                  placeholder="Fiyat ($)"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-sm text-red-400 font-mono focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="bg-neutral-900/60 border border-neutral-800 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">1 Aylık</span>
                  <label className="flex items-center gap-1.5 text-[11px] text-neutral-300 cursor-pointer">
                    <input type="checkbox" name="stock_monthly" defaultChecked={stock.monthly !== false} className="accent-red-600" />
                    <span>Stok Var</span>
                  </label>
                </div>
                <input
                  name="price_monthly"
                  type="number"
                  step="0.01"
                  defaultValue={product.pricing?.monthly || ''}
                  placeholder="Fiyat ($)"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-sm text-red-400 font-mono focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="bg-neutral-900/60 border border-neutral-800 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Lifetime</span>
                  <label className="flex items-center gap-1.5 text-[11px] text-neutral-300 cursor-pointer">
                    <input type="checkbox" name="stock_lifetime" defaultChecked={stock.lifetime !== false} className="accent-red-600" />
                    <span>Stok Var</span>
                  </label>
                </div>
                <input
                  name="price_lifetime"
                  type="number"
                  step="0.01"
                  defaultValue={product.pricing?.lifetime || ''}
                  placeholder="Fiyat ($)"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-sm text-red-400 font-mono focus:outline-none focus:border-red-600"
                />
              </div>
            </div>
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">Açıklama</label>
            <textarea
              name="description"
              defaultValue={product.description}
              rows={4}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-red-950 cursor-pointer"
          >
            Değişiklikleri Kaydet
          </button>
        </form>
      </div>
    </div>
  );
}