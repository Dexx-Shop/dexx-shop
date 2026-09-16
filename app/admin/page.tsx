import { getAdminUsers, getCurrentUser } from 'lib/auth';
import { getLowestPrice, getProducts } from 'lib/products';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createProductAction, removeProductAction } from './actions';
import AdminManager from './AdminManager';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'owner' && user.role !== 'admin' && user.role !== 'moderator')) {
    redirect('/');
  }

  const isOwner = user.role === 'owner';
  const products = await getProducts();
  const admins = await getAdminUsers();

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-red-600 selection:text-white pb-24">
      {/* Üst Bar */}
      <header className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="DexX Logo"
              className="w-9 h-9 object-contain filter drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
            />
            <h1 className="text-lg font-black tracking-wider uppercase">
              DexX <span className="text-red-500 font-bold text-xs">YÖNETİM</span>
            </h1>
            <span className="text-[10px] bg-red-950/80 text-red-400 border border-red-800/80 px-2.5 py-0.5 rounded-full uppercase font-bold">
              {user.role}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400 hidden sm:inline-block">@{user.username}</span>
            <Link
              href="/"
              className="text-xs bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-4 py-2 rounded-xl transition"
            >
              ← Vitrine Dön
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-12">
        {/* İstatistikler */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-md">
            <span className="text-xs text-neutral-400 font-medium">Toplam Ürün / Mod</span>
            <p className="text-3xl font-black text-white mt-1">{products.length}</p>
          </div>
          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-md">
            <span className="text-xs text-neutral-400 font-medium">Yetkili Yöneticiler</span>
            <p className="text-3xl font-black text-red-500 mt-1">{admins.length}</p>
          </div>
          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-md">
            <span className="text-xs text-neutral-400 font-medium">Para Birimi</span>
            <p className="text-2xl font-black text-red-500 mt-1">USD ($)</p>
          </div>
        </div>

        {/* 1. BÖLÜM: YÖNETİCİ KADROSU */}
        <section className="space-y-4">
          <div className="border-b border-neutral-800 pb-3">
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              🛡️ Yönetici Kadrosu
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">Admin ve moderatör yetkilendirme paneli.</p>
          </div>
          <AdminManager admins={admins} isOwner={isOwner} />
        </section>

        {/* 2. BÖLÜM: YENİ MOD / ÜRÜN EKLEME */}
        <section className="space-y-6 pt-4">
          <div className="border-b border-neutral-800 pb-3">
            <h2 className="text-lg font-black text-white tracking-tight">🎮 Yeni Ürün & Lisans Ekle</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Süre fiyatlarını ve her süreye özel stok durumunu ($ USD) olarak belirleyin.
            </p>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <form action={createProductAction} encType="multipart/form-data" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">
                    Mod / Paket Adı
                  </label>
                  <input
                    name="title"
                    required
                    placeholder="Örn: Disconnect Internal Rust"
                    className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">
                    Hangi Oyun?
                  </label>
                  <input
                    name="game"
                    required
                    placeholder="Örn: RUST, VALORANT, FIVEM"
                    className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl p-3 text-sm uppercase focus:outline-none focus:border-red-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">
                    Güvenlik Etiketi
                  </label>
                  <input
                    name="securityTag"
                    required
                    placeholder="Örn: Undetected, Kernel Level"
                    className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600 transition"
                  />
                </div>
              </div>

              {/* Fiyatlar & Stok Yönetimi */}
              <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
                  <span className="text-xs uppercase font-bold text-red-500 tracking-wider">
                    Lisans Seçenekleri & Stok Durumu ($ USD)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400">Genel Durum:</span>
                    <select
                      name="status"
                      className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-red-600 cursor-pointer"
                    >
                      <option value="active">🟢 Aktif / Güncel</option>
                      <option value="updating">🟡 Güncelleniyor</option>
                      <option value="inactive">🔴 Bakımda</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* 1 Günlük */}
                  <div className="bg-neutral-900/60 border border-neutral-800 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">1 Günlük</span>
                      <label className="flex items-center gap-1.5 text-[11px] text-neutral-300 cursor-pointer">
                        <input type="checkbox" name="stock_daily" defaultChecked className="accent-red-600" />
                        <span>Stok Var</span>
                      </label>
                    </div>
                    <input
                      name="price_daily"
                      type="number"
                      step="0.01"
                      placeholder="Fiyat ($)"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-sm text-red-400 font-mono focus:outline-none focus:border-red-600"
                    />
                  </div>

                  {/* 1 Haftalık */}
                  <div className="bg-neutral-900/60 border border-neutral-800 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">1 Haftalık</span>
                      <label className="flex items-center gap-1.5 text-[11px] text-neutral-300 cursor-pointer">
                        <input type="checkbox" name="stock_weekly" defaultChecked className="accent-red-600" />
                        <span>Stok Var</span>
                      </label>
                    </div>
                    <input
                      name="price_weekly"
                      type="number"
                      step="0.01"
                      placeholder="Fiyat ($)"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-sm text-red-400 font-mono focus:outline-none focus:border-red-600"
                    />
                  </div>

                  {/* 1 Aylık */}
                  <div className="bg-neutral-900/60 border border-neutral-800 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">1 Aylık</span>
                      <label className="flex items-center gap-1.5 text-[11px] text-neutral-300 cursor-pointer">
                        <input type="checkbox" name="stock_monthly" defaultChecked className="accent-red-600" />
                        <span>Stok Var</span>
                      </label>
                    </div>
                    <input
                      name="price_monthly"
                      type="number"
                      step="0.01"
                      placeholder="Fiyat ($)"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-sm text-red-400 font-mono focus:outline-none focus:border-red-600"
                    />
                  </div>

                  {/* Lifetime */}
                  <div className="bg-neutral-900/60 border border-neutral-800 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Lifetime</span>
                      <label className="flex items-center gap-1.5 text-[11px] text-neutral-300 cursor-pointer">
                        <input type="checkbox" name="stock_lifetime" defaultChecked className="accent-red-600" />
                        <span>Stok Var</span>
                      </label>
                    </div>
                    <input
                      name="price_lifetime"
                      type="number"
                      step="0.01"
                      placeholder="Fiyat ($)"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-sm text-red-400 font-mono focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>
              </div>

              {/* Görsel & Açıklama */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">
                    Fotoğraf Yükle (Dosya)
                  </label>
                  <input
                    type="file"
                    name="imageFile"
                    accept="image/*"
                    className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700 cursor-pointer focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">
                    Veya Görsel URL
                  </label>
                  <input
                    name="imageUrl"
                    placeholder="URL yapıştırabilirsiniz"
                    className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600 transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">
                    Mod Açıklaması
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Aimbot özellikleri, ESP, Windows sürümleri..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm focus:outline-none focus:border-red-600 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 rounded-xl transition cursor-pointer shadow-lg shadow-red-950"
              >
                Modu Vitrine Ekle
              </button>
            </form>
          </div>

          {/* 3. BÖLÜM: YAYINDAKİ MODLAR LİSTESİ */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-400">
              Yayındaki Modlar ({products.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((p) => {
                const lowest = getLowestPrice(p.pricing);
                const statusColor =
                  p.status === 'active'
                    ? 'text-red-500'
                    : p.status === 'updating'
                    ? 'text-amber-400'
                    : 'text-neutral-500';

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 flex items-center justify-between hover:border-neutral-700 transition"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-16 h-16 object-cover rounded-xl bg-neutral-950 border border-neutral-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-neutral-400 px-1.5 py-0.5 bg-neutral-950 rounded border border-neutral-800">
                            {p.game}
                          </span>
                          <span className={`text-[10px] font-bold ${statusColor}`}>
                            ● {p.status === 'active' ? 'Aktif' : p.status === 'updating' ? 'Güncelleniyor' : 'Bakımda'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white truncate mt-1">{p.title}</h4>
                        <p className="text-neutral-400 text-xs mt-0.5 font-mono">
                          Starting at <span className="text-red-500 font-bold">${lowest.toFixed(2)}</span> USD
                        </p>
                      </div>
                    </div>

                    {/* Düzenle & Sil Butonları */}
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <Link
                        href={`/admin/edit/${p.id}`}
                        className="text-xs bg-neutral-800 hover:bg-neutral-700 text-white font-medium px-3.5 py-2 rounded-xl transition border border-neutral-700"
                      >
                        Düzenle
                      </Link>
                      <form action={removeProductAction.bind(null, p.id)}>
                        <button
                          type="submit"
                          className="text-xs bg-red-950/60 border border-red-800/80 text-red-300 hover:bg-red-900 px-3.5 py-2 rounded-xl transition cursor-pointer"
                        >
                          Sil
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}