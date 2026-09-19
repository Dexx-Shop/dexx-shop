'use client';

import { Product } from 'lib/products';
import { useState } from 'react';
import { deleteProductAction, updateProductAction } from './actions';

export default function ProductListManager({ initialProducts }: { initialProducts: Product[] }) {
  const [products] = useState<Product[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateProductAction(formData);
    setLoading(false);
    if (res.success) {
      setEditingProduct(null);
      window.location.reload();
    } else {
      alert(res.error || 'Güncelleme yapılamadı.');
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`"${title}" adlı ürünü silmek istediğinize emin misiniz?`)) return;
    await deleteProductAction(id);
    window.location.reload();
  }

  return (
    <div>
      {/* Mevcut Ürün Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-neutral-950 border border-neutral-800/80 rounded-2xl p-4 flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-950/80 border border-red-800/80 text-red-400">
                  {p.game}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">{p.securityTag || 'Undetected'}</span>
              </div>
              <h3 className="font-bold text-sm text-white line-clamp-1">{p.title}</h3>
              <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1">{p.description || 'Açıklama yok'}</p>
              
              <div className="flex items-center gap-2 mt-2 text-[10px] text-neutral-400 font-mono">
                <span>G: ${p.pricing?.daily || 0}</span>
                <span>•</span>
                <span>H: ${p.pricing?.weekly || 0}</span>
                <span>•</span>
                <span>A: ${p.pricing?.monthly || 0}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-neutral-850">
              <button
                type="button"
                onClick={() => setEditingProduct(p)}
                className="flex-1 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-white transition cursor-pointer"
              >
                ✏️ Düzenle
              </button>
              <button
                type="button"
                onClick={() => handleDelete(p.id, p.title)}
                className="py-1.5 px-3 rounded-lg bg-red-950/50 hover:bg-red-900/60 border border-red-800 text-xs font-semibold text-red-400 transition cursor-pointer"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Düzenleme Modalı */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e11] border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white">Ürünü Düzenle: {editingProduct.title}</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-neutral-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <input type="hidden" name="id" value={editingProduct.id} />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Başlık</label>
                  <input
                    name="title"
                    defaultValue={editingProduct.title}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Oyun Kategorisi</label>
                  <select
                    name="game"
                    defaultValue={editingProduct.game?.toUpperCase() || 'RUST'}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-bold uppercase focus:outline-none focus:border-red-600 cursor-pointer"
                  >
                    <option value="RUST">RUST</option>
                    <option value="FIVEM">FIVEM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Görsel URL</label>
                <input
                  name="image"
                  defaultValue={editingProduct.image}
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Açıklama</label>
                <textarea
                  name="description"
                  defaultValue={editingProduct.description}
                  rows={2}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Günlük ($)</label>
                  <input
                    name="price_daily"
                    type="number"
                    step="0.01"
                    defaultValue={editingProduct.pricing?.daily}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Haftalık ($)</label>
                  <input
                    name="price_weekly"
                    type="number"
                    step="0.01"
                    defaultValue={editingProduct.pricing?.weekly}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Aylık ($)</label>
                  <input
                    name="price_monthly"
                    type="number"
                    step="0.01"
                    defaultValue={editingProduct.pricing?.monthly}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-xs text-neutral-300 hover:text-white"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}