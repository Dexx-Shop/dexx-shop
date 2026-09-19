import fs from 'fs';
import { getCurrentUser } from 'lib/auth';
import { getProducts } from 'lib/products';
import { getCoupons } from 'lib/wallet';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import path from 'path';

import { addProductAction, getOrderLogsAction } from './actions';
import AdminHeroSettings from './AdminHeroSettings';
import AdminManager from './AdminManager';
import CouponManager from './CouponManager';
import OrderLogsManager from './OrderLogsManager';
import ProductListManager from './ProductListManager';

export const dynamic = 'force-dynamic';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

function getAllUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'owner' && user.role !== 'admin' && user.role !== 'moderator')) {
    redirect('/login');
  }

  const isOwner = user.role === 'owner';
  const products = await getProducts();
  const allUsers = getAllUsers();
  const admins = allUsers.filter((u: any) => u.role === 'owner' || u.role === 'admin' || u.role === 'moderator');
  const coupons = await getCoupons();
  const orderLogs = await getOrderLogsAction();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto pt-6 space-y-10">
        {/* Üst Başlık */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                DexX Yönetim Paneli
              </h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Giriş yapan: <strong className="text-white">@{user.username || user.email}</strong> (Yetki:{' '}
              <span className="uppercase text-red-500 font-bold">{user.role}</span>)
            </p>
          </div>

          <Link
            href="/"
            className="text-xs px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 transition"
          >
            ← Mağazaya Dön
          </Link>
        </div>

        {/* 1. BÖLÜM: HERO CANLI DUYURU & SAYAÇ AYARLARI */}
        <section>
          <AdminHeroSettings />
        </section>

        {/* 2. BÖLÜM: SİPARİŞ & KEY LOGLARI */}
        {isOwner && (
          <section>
            <OrderLogsManager initialOrders={orderLogs} />
          </section>
        )}

        {/* 3. BÖLÜM: KUPON ÜRETİCİ */}
        {isOwner && (
          <section>
            <CouponManager initialCoupons={coupons} />
          </section>
        )}

        {/* 4. BÖLÜM: YETKİLİ YÖNETİMİ */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>👥</span>
              <span>Yetkili & Yönetici Kadrosu</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">Admin ve moderatör yetkilendirme tablosu.</p>
          </div>
          <AdminManager admins={admins} isOwner={isOwner} currentUserId={user.id} />
        </section>

        {/* 5. BÖLÜM: YENİ ÜRÜN / MOD EKLEME FORMU */}
        <section className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <span>📦</span>
            <span>Yeni Ürün / Mod Ekle</span>
          </h2>
          <p className="text-xs text-neutral-400 mb-6">
            Vitrine eklenecek yeni oyun modunu, video/görsel medyasını, durumunu ve fiyatlarını belirleyin.
          </p>

          <form action={addProductAction} className="space-y-4 max-w-3xl">
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

        {/* 6. BÖLÜM: MEVCUT ÜRÜNLER LİSTESİ */}
        <section className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
            <span>Yayındaki Ürünler ({products.length})</span>
          </h2>
          <ProductListManager initialProducts={products} />
        </section>
      </div>
    </div>
  );
}