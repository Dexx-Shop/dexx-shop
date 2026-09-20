'use client';

import { useState } from 'react';
import { deleteProductAction, updateProductAction } from './actions';

interface DynamicPackage {
  id: string;
  name: string;
  price: number;
  badge?: string;
}

export default function ProductListManager({ initialProducts }: { initialProducts: any[] }) {
  const [products] = useState<any[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editPackages, setEditPackages] = useState<DynamicPackage[]>([]);
  const [loading, setLoading] = useState(false);

  // Düzenleme modalı açıldığında paketleri hazırla
  function startEditing(p: any) {
    setEditingProduct(p);
    if (p.packages && Array.isArray(p.packages) && p.packages.length > 0) {
      setEditPackages(p.packages);
    } else {
      // Eski yapıyı otomatik olarak paketlere çevir
      const initial: DynamicPackage[] = [];
      if (p.pricing?.daily) initial.push({ id: 'pkg_' + Date.now() + '_1', name: '1 Günlük', price: p.pricing.daily });
      if (p.pricing?.weekly) initial.push({ id: 'pkg_' + Date.now() + '_2', name: '1 Haftalık', price: p.pricing.weekly, badge: 'Popüler' });
      if (p.pricing?.monthly) initial.push({ id: 'pkg_' + Date.now() + '_3', name: '1 Aylık', price: p.pricing.monthly, badge: 'En Avantajlı' });
      setEditPackages(initial.length > 0 ? initial : [{ id: 'pkg_' + Date.now(), name: 'Lifetime', price: 10 }]);
    }
  }

  function addPackageRow() {
    setEditPackages((prev) => [
      ...prev,
      { id: 'pkg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5), name: 'Yeni Paket', price: 5 }
    ]);
  }

  function removePackageRow(id: string) {
    setEditPackages((prev) => prev.filter((pkg) => pkg.id !== id));
  }

  function updatePackageRow(id: string, key: 'name' | 'price' | 'badge', val: string | number) {
    setEditPackages((prev) =>
      prev.map((pkg) => (pkg.id === id ? { ...pkg, [key]: val } : pkg))
    );
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (editPackages.length === 0) {
      alert('Lütfen en az bir adet paket ve fiyat tanımlayın!');
      return;
    }
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set('packages_json', JSON.stringify(editPackages));

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
        {products.map((p) => {
          const status = p.status || 'active';
          const pkgs: DynamicPackage[] = p.packages && p.packages.length > 0
            ? p.packages
            : [
                ...(p.pricing?.daily ? [{ name: 'G', price: p.pricing.daily }] : []),
                ...(p.pricing?.weekly ? [{ name: 'H', price: p.pricing.weekly }] : []),
                ...(p.pricing?.monthly ? [{ name: 'A', price: p.pricing.monthly }] : [])
              ];

          return (
            <div
              key={p.id}
              className="bg-neutral-950 border border-neutral-800/80 rounded-2xl p-4 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-950/80 border border-red-800/80 text-red-400">
                    {p.game}
                  </span>
                  
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      status === 'active'
                        ? 'bg-emerald-950/70 border-emerald-800 text-emerald-400'
                        : status === 'updating'
                        ? 'bg-amber-950/70 border-amber-800 text-amber-400'
                        : 'bg-red-950/70 border-red-800 text-red-400'
                    }`}
                  >
                    {status === 'active' ? '🟢 Aktif' : status === 'updating' ? '🟡 Güncelleniyor' : '🔴 Bakımda'}
                  </span>
                </div>
                
                <h3 className="font-bold text-sm text-white line-clamp-1">{p.title}</h3>
                <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1">{p.description || 'Açıklama yok'}</p>
                
                {/* Dinamik Paketlerin Özeti */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  {pkgs.map((pkg, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono">
                      {pkg.name}: <strong>${pkg.price}</strong>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-neutral-850">
                <button
                  type="button"
                  onClick={() => startEditing(p)}
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
          );
        })}
      </div>

      {/* Düzenleme Modalı */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e11] border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Oyun</label>
                  <select
                    name="game"
                    defaultValue={editingProduct.game?.toUpperCase() || 'RUST'}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-bold uppercase focus:outline-none focus:border-red-600 cursor-pointer"
                  >
                    <option value="RUST">RUST</option>
                    <option value="FIVEM">FIVEM</option>
                    <option value="VALORANT">VALORANT</option>
                    <option value="CS2">CS2</option>
                    <option value="ACCOUNT">ACCOUNT / HESAP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Durum</label>
                  <select
                    name="status"
                    defaultValue={editingProduct.status || 'active'}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-semibold focus:outline-none focus:border-red-600 cursor-pointer"
                  >
                    <option value="active">🟢 Aktif / Güvenli</option>
                    <option value="updating">🟡 Güncelleniyor</option>
                    <option value="inactive">🔴 Bakımda</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Güvenlik Etiketi</label>
                  <input
                    name="securityTag"
                    defaultValue={editingProduct.securityTag || 'Undetected'}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Açıklama</label>
                <textarea
                  name="description"
                  defaultValue={editingProduct.description}
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600 resize-none"
                />
              </div>

              {/* DİNAMİK PAKET VE FİYAT YÖNETİMİ */}
              <div className="border border-neutral-800 bg-neutral-950/60 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Paket ve Fiyat Seçenekleri</span>
                    <span className="text-[10px] text-neutral-400">Ürüne ait dilediğin kadar süre ve fiyat belirleyebilirsin.</span>
                  </div>
                  <button
                    type="button"
                    onClick={addPackageRow}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold transition cursor-pointer"
                  >
                    + Paket Ekle
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  {editPackages.map((pkg) => (
                    <div key={pkg.id} className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 p-2 rounded-xl">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Paket Adı (Örn: 3 Günlük, Lifetime)"
                          value={pkg.name}
                          onChange={(e) => updatePackageRow(pkg.id, 'name', e.target.value)}
                          className="w-full bg-black/50 border border-neutral-800 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-red-600"
                          required
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Fiyat ($)"
                          value={pkg.price}
                          onChange={(e) => updatePackageRow(pkg.id, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full bg-black/50 border border-neutral-800 rounded-lg p-1.5 text-xs text-white font-mono focus:outline-none focus:border-red-600"
                          required
                        />
                      </div>
                      <div className="w-28">
                        <input
                          type="text"
                          placeholder="Etiket (Opsiyonel)"
                          value={pkg.badge || ''}
                          onChange={(e) => updatePackageRow(pkg.id, 'badge', e.target.value)}
                          className="w-full bg-black/50 border border-neutral-800 rounded-lg p-1.5 text-xs text-neutral-300 focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePackageRow(pkg.id)}
                        className="px-2 py-1.5 text-neutral-500 hover:text-red-400 text-xs cursor-pointer"
                        title="Sil"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-xs text-neutral-300 hover:text-white cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
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