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

export default function AdminDashboardClient({
  user,
  isOwner,
  products,
  admins,
  coupons,
  orderLogs,
}: AdminDashboardClientProps) {
  // Varsayılan açık sekme: 'tickets' veya 'products'
  const [activeTab, setActiveTab] = useState<
    'tickets' | 'products' | 'new_product' | 'orders' | 'coupons' | 'team' | 'hero'
  >('tickets');

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
      
      {/* SOL TARAFI: DİKEY SEKME / KATEGORİ MENÜSÜ (3 Sütun) */}
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

      {/* SAĞ TARAFI: SEÇİLEN SEKMEYE ÖZGÜ İÇERİK ALANI (9 Sütun) */}
      <main className="lg:col-span-9 space-y-6">
        
        {/* 1. DESTEK TALEPLERİ SEKMESİ */}
        {activeTab === 'tickets' && (
          <div className="animate-in fade-in duration-200">
            <TicketManager currentUserId={user.id} />
          </div>
        )}

        {/* 2. YAYINDAKİ MODLAR LİSTESİ SEKMESİ */}
        {activeTab === 'products' && (
          <section className="bg-[#0c0c10] border border-white/[0.08] rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🎮</span>
                  <span>Yayındaki Modlar & Yazılımlar</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Fiyat, stok ve durumunu değiştirmek istediğiniz modu düzenleyin.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('new_product')}
                className="text-xs font-bold px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition cursor-pointer"
              >
                + Yeni Mod Ekle
              </button>
            </div>
            <ProductListManager initialProducts={products} />
          </section>
        )}

        {/* 3. YENİ ÜRÜN / MOD EKLEME FORMU SEKMESİ */}
        {activeTab === 'new_product' && (
          <section className="bg-[#0c0c10] border border-white/[0.08] rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl animate-in fade-in duration-200">
            <div className="border-b border-white/[0.06] pb-4 mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>➕</span>
                <span>Yeni Ürün / Mod Yayınla</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Vitrine eklenecek yeni oyun modunu, video/görsel medyasını, durumunu ve fiyatlarını belirleyin.
              </p>
            </div>

            <form action={addProductAction} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Ürün Başlığı
                  </label>
                  <input
                    name="title"
                    type="text"
                    required
                    placeholder="Örn: DexX Rust Private"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Oyun Kategorisi
                  </label>
                  <select
                    name="game"
                    required
                    defaultValue="RUST"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white font-bold uppercase focus:outline-none focus:border-red-600 transition cursor-pointer"
                  >
                    <option value="RUST">RUST</option>
                    <option value="FIVEM">FIVEM</option>
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
                    placeholder="https://... (Ana görsel)"
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
                    placeholder="YouTube veya .mp4 linki"
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
                    placeholder="Undetected"
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
                  Açıklama & Özellikler
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Aimbot, ESP, Misc özellikleri..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition resize-none"
                />
              </div>

              {/* Fiyatlandırma */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Günlük ($)</label>
                  <input
                    name="price_daily"
                    type="number"
                    step="0.01"
                    placeholder="5.00"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Haftalık ($)</label>
                  <input
                    name="price_weekly"
                    type="number"
                    step="0.01"
                    placeholder="15.00"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Aylık ($)</label>
                  <input
                    name="price_monthly"
                    type="number"
                    step="0.01"
                    placeholder="35.00"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-sm text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase px-6 py-3 rounded-xl transition cursor-pointer shadow-lg shadow-red-950 mt-2"
              >
                + Ürünü Yayınla
              </button>
            </form>
          </section>
        )}

        {/* 4. SİPARİŞ & KEY LOGLARI SEKMESİ */}
        {activeTab === 'orders' && isOwner && (
          <div className="animate-in fade-in duration-200">
            <OrderLogsManager initialOrders={orderLogs} />
          </div>
        )}

        {/* 5. BAKİYE KUPONLARI SEKMESİ */}
        {activeTab === 'coupons' && isOwner && (
          <div className="animate-in fade-in duration-200">
            <CouponManager initialCoupons={coupons} />
          </div>
        )}

        {/* 6. YETKİLİ KADROSU SEKMESİ */}
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

        {/* 7. HERO DUYURU AYARLARI SEKMESİ */}
        {activeTab === 'hero' && (
          <div className="animate-in fade-in duration-200">
            <AdminHeroSettings />
          </div>
        )}

      </main>

    </div>
  );
}