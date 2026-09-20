'use client';

import { useState } from 'react';
import { addProductAction } from './actions';
import AdminHeroSettings from './AdminHeroSettings';
import AdminManager from './AdminManager';
import CouponManager from './CouponManager';
import OrderLogsManager from './OrderLogsManager';
import ProductListManager from './ProductListManager';
import TicketManager from './TicketManager';

interface AdminDashboardClientProps {
  user: any;
  isOwner: boolean;
  products: any[];
  admins: any[];
  coupons: any[];
  orderLogs: any[];
}

interface NewPackageItem {
  id: string;
  name: string;
  price: number;
  badge?: string;
}

export default function AdminDashboardClient({
  user,
  isOwner,
  products,
  admins,
  coupons,
  orderLogs,
}: AdminDashboardClientProps) {
  // Varsayılan açık sekme
  const [activeTab, setActiveTab] = useState<
    'tickets' | 'products' | 'new_product' | 'orders' | 'coupons' | 'team' | 'hero'
  >('tickets');

  // Yeni ürün için dinamik paket listesi
  const [newPackages, setNewPackages] = useState<NewPackageItem[]>([
    { id: 'pkg_1', name: 'Lifetime', price: 15, badge: 'Süresiz' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function addNewPackageRow() {
    setNewPackages((prev) => [
      ...prev,
      {
        id: 'pkg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        name: 'Yeni Paket',
        price: 5,
        badge: '',
      },
    ]);
  }

  function removeNewPackageRow(id: string) {
    if (newPackages.length === 1) {
      alert('En az 1 adet paket/fiyat seçeneği bulunmalıdır.');
      return;
    }
    setNewPackages((prev) => prev.filter((p) => p.id !== id));
  }

  function updateNewPackageRow(id: string, key: 'name' | 'price' | 'badge', val: string | number) {
    setNewPackages((prev) =>
      prev.map((pkg) => (pkg.id === id ? { ...pkg, [key]: val } : pkg))
    );
  }

  async function handleAddProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (newPackages.length === 0) {
      alert('Lütfen en az bir adet paket tanımlayın.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set('packages_json', JSON.stringify(newPackages));

    const res = await addProductAction(formData);
    setIsSubmitting(false);

    if (res?.success) {
      alert('Ürün başarıyla yayına alındı!');
      window.location.reload();
    } else {
      alert(res?.error || 'Ürün eklenirken bir sorun oluştu.');
    }
  }

  const navItems = [
    { id: 'tickets', label: 'Destek Talepleri', icon: '🎫', badge: null },
    { id: 'products', label: 'Yayındaki Modlar', icon: '🎮', badge: products.length },
    { id: 'new_product', label: 'Yeni Mod / Ürün Ekle', icon: '➕', badge: null },
    ...(isOwner
      ? [
          { id: 'orders', label: 'Sipariş & Key Logları', icon: '📋', badge: orderLogs?.length || null },
          { id: 'coupons', label: 'Bakiye Kuponları', icon: '🎟️', badge: coupons?.length || null },
        ]
      : []),
    { id: 'team', label: 'Yetkili Kadrosu', icon: '👥', badge: admins.length },
    { id: 'hero', label: 'Hero & Canlı Duyuru', icon: '⚡', badge: null },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* SOL MENÜ */}
      <aside className="lg:col-span-3 lg:sticky lg:top-28 space-y-2 bg-[#0c0c10] border border-white/[0.08] p-3.5 rounded-3xl shadow-2xl">
        <div className="px-3 py-2 border-b border-white/[0.06] mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
            Yönetim Menüsü
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-950/60 scale-[1.01]'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-lg font-mono ${
                      isActive ? 'bg-black/30 text-white' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* SAĞ İÇERİK ALANI */}
      <main className="lg:col-span-9 space-y-6">
        
        {/* 1. DESTEK TALEPLERİ */}
        {activeTab === 'tickets' && (
          <div className="animate-in fade-in duration-200">
            <TicketManager currentUserId={user.id} />
          </div>
        )}

        {/* 2. YAYINDAKİ MODLAR */}
        {activeTab === 'products' && (
          <section className="bg-[#0c0c10] border border-white/[0.08] rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🎮</span>
                  <span>Yayındaki Modlar & Ürünler</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Paketlerini, fiyatlarını veya durumunu değiştirmek istediğiniz ürünü düzenleyin.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('new_product')}
                className="text-xs font-bold px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition cursor-pointer"
              >
                + Yeni Ürün Ekle
              </button>
            </div>
            <ProductListManager initialProducts={products} />
          </section>
        )}

        {/* 3. YENİ ÜRÜN EKLEME (DİNAMİK PAKET DESTEKLİ) */}
        {activeTab === 'new_product' && (
          <section className="bg-[#0c0c10] border border-white/[0.08] rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl animate-in fade-in duration-200">
            <div className="border-b border-white/[0.06] pb-4 mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>➕</span>
                <span>Yeni Ürün / Mod Yayınla</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Ürününüzün detaylarını ve istediğiniz süre/fiyat paketlerini serbestçe belirleyin.
              </p>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Ürün Başlığı
                  </label>
                  <input
                    name="title"
                    type="text"
                    required
                    placeholder="Örn: Rust No Recoil veya Rust Account"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Kategori / Oyun
                  </label>
                  <select
                    name="game"
                    required
                    defaultValue="RUST"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white font-bold uppercase focus:outline-none focus:border-red-600 transition cursor-pointer"
                  >
                    <option value="RUST">RUST</option>
                    <option value="FIVEM">FIVEM</option>
                    <option value="VALORANT">VALORANT</option>
                    <option value="CS2">CS2</option>
                    <option value="ACCOUNT">ACCOUNT / HESAP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Ürün Durumu
                  </label>
                  <select
                    name="status"
                    required
                    defaultValue="active"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-red-600 transition cursor-pointer"
                  >
                    <option value="active">🟢 Aktif / Güvenli</option>
                    <option value="updating">🟡 Güncelleniyor</option>
                    <option value="inactive">🔴 Bakımda / Güvenli Değil</option>
                  </select>
                </div>
              </div>

              {/* Medya & Video */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Kapak Görseli (URL)
                  </label>
                  <input
                    name="image"
                    type="url"
                    required
                    placeholder="https://... (Görsel URL)"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Tanıtım Videosu Linki
                  </label>
                  <input
                    name="videoUrl"
                    type="url"
                    placeholder="YouTube veya .mp4 linki (Opsiyonel)"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Güvenlik Etiketi
                  </label>
                  <input
                    name="securityTag"
                    type="text"
                    defaultValue="Undetected"
                    placeholder="Undetected veya Anında Teslimat"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Ek Görseller (Her satıra bir görsel linki)
                </label>
                <textarea
                  name="mediaUrls"
                  rows={2}
                  placeholder="https://...&#10;https://..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-red-600 transition resize-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Ürün Açıklaması
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Ürün hakkında detaylı bilgi girin..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition resize-none"
                />
              </div>

              {/* DİNAMİK PAKETLER VE FİYAT LİSTESİ */}
              <div className="border border-white/[0.08] bg-black/40 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Paket ve Fiyat Seçenekleri</span>
                    <span className="text-[10px] text-neutral-400">
                      Örn: Rust Account için tek bir "Lifetime = $25" satırı bırakabilir veya birden fazla süre ekleyebilirsiniz.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addNewPackageRow}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold transition cursor-pointer shadow-md shadow-red-950/40"
                  >
                    + Paket Ekle
                  </button>
                </div>

                <div className="space-y-2.5 pt-1">
                  {newPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="flex items-center gap-2.5 bg-[#09090c] border border-white/[0.06] p-2.5 rounded-xl"
                    >
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Paket Adı (Örn: Lifetime, 3 Günlük, 1 Haftalık)"
                          value={pkg.name}
                          onChange={(e) => updateNewPackageRow(pkg.id, 'name', e.target.value)}
                          required
                          className="w-full bg-black/60 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-medium"
                        />
                      </div>
                      <div className="w-28">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Fiyat ($)"
                          value={pkg.price}
                          onChange={(e) => updateNewPackageRow(pkg.id, 'price', parseFloat(e.target.value) || 0)}
                          required
                          className="w-full bg-black/60 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <div className="w-32">
                        <input
                          type="text"
                          placeholder="Rozet (Örn: Popüler)"
                          value={pkg.badge || ''}
                          onChange={(e) => updateNewPackageRow(pkg.id, 'badge', e.target.value)}
                          className="w-full bg-black/60 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewPackageRow(pkg.id)}
                        className="px-2 py-1 text-neutral-500 hover:text-red-400 text-sm cursor-pointer"
                        title="Paketi Kaldır"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase px-8 py-3.5 rounded-xl transition duration-300 cursor-pointer shadow-lg shadow-red-950 mt-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Yayınlanıyor...' : '+ Ürünü Yayınla'}
              </button>
            </form>
          </section>
        )}

        {/* 4. SİPARİŞ & KEY LOGLARI */}
        {activeTab === 'orders' && isOwner && (
          <div className="animate-in fade-in duration-200">
            <OrderLogsManager initialOrders={orderLogs} />
          </div>
        )}

        {/* 5. BAKİYE KUPONLARI */}
        {activeTab === 'coupons' && isOwner && (
          <div className="animate-in fade-in duration-200">
            <CouponManager initialCoupons={coupons} />
          </div>
        )}

        {/* 6. YETKİLİ KADROSU */}
        {activeTab === 'team' && (
          <section className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-white/[0.06] pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>👥</span>
                <span>Yetkili & Yönetici Kadrosu</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">Admin ve moderatör yetkilendirme tablosu.</p>
            </div>
            <AdminManager admins={admins} isOwner={isOwner} currentUserId={user.id} />
          </section>
        )}

        {/* 7. HERO DUYURU AYARLARI */}
        {activeTab === 'hero' && (
          <div className="animate-in fade-in duration-200">
            <AdminHeroSettings />
          </div>
        )}

      </main>

    </div>
  );
}