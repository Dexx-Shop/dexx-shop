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

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-white pb-24">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold">Modu Düzenle</h1>
          <p className="text-xs text-neutral-400 mt-1">Fiyatlar, stok durumları ve mod detaylarını güncelleyin</p>
        </div>
        <Link
          href="/admin"
          className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-4 py-2 rounded-xl transition"
        >
          ← Panele Dön
        </Link>
      </div>

      <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
        <form action={updateProductAction} encType="multipart/form-data" className="space-y-6">
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="currentImage" value={product.image} />

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
                defaultValue={product.securityTag}
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          {/* Lisans Fiyatları & Stok Kutucukları */}
          <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
              <span className="text-xs uppercase font-bold text-red-500 tracking-wider">
                Lisans Fiyatları & Stok Durumu ($ USD)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Durum:</span>
                <select
                  name="status"
                  defaultValue={product.status}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-red-600 cursor-pointer"
                >
                  <option value="active">🟢 Aktif / Güncel</option>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">Yeni Görsel Yükle (İsteğe Bağlı)</label>
              <input
                type="file"
                name="imageFile"
                accept="image/*"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700 cursor-pointer"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">Açıklama</label>
              <textarea
                name="description"
                defaultValue={product.description}
                rows={4}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600"
              />
            </div>
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