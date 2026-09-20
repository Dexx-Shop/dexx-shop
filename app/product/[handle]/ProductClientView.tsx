'use client';

import { useCart } from 'lib/cart';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export interface ProductPackage {
  id: string;
  name: string; // Örn: "3 Günlük", "1 Aylık", "Lifetime"
  price: number;
  badge?: string; // Örn: "Popüler", "En Avantajlı"
}

export default function ProductClientView({ product }: { product: any }) {
  const { addItem, openCart } = useCart();

  // Medya Havuzu: Video + Fotoğraflar
  const initialMedia: { type: 'video' | 'image'; url: string }[] = [];
  if (product.videoUrl) initialMedia.push({ type: 'video', url: product.videoUrl });
  if (product.media && product.media.length > 0) {
    product.media.forEach((m: string) => initialMedia.push({ type: 'image', url: m }));
  } else if (product.image) {
    initialMedia.push({ type: 'image', url: product.image });
  }

  const [mediaList] = useState(initialMedia);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // Dinamik Paketleri Belirleme (Geriye dönük uyumluluk: packages yoksa eski pricing'i dönüştür)
  const availablePackages: ProductPackage[] = useMemo(() => {
    if (product.packages && Array.isArray(product.packages) && product.packages.length > 0) {
      return product.packages;
    }
    const legacy: ProductPackage[] = [];
    if (product.pricing?.daily) {
      legacy.push({ id: 'pkg_daily', name: '1 Günlük', price: Number(product.pricing.daily) });
    }
    if (product.pricing?.weekly) {
      legacy.push({ id: 'pkg_weekly', name: '1 Haftalık', price: Number(product.pricing.weekly), badge: 'Popüler' });
    }
    if (product.pricing?.monthly) {
      legacy.push({ id: 'pkg_monthly', name: '1 Aylık', price: Number(product.pricing.monthly), badge: 'En Avantajlı' });
    }
    return legacy.length > 0 ? legacy : [{ id: 'pkg_def', name: 'Standart Lisans', price: 0 }];
  }, [product]);

  const [selectedPkgId, setSelectedPkgId] = useState<string>(availablePackages[0]?.id || '');
  const activePackage = availablePackages.find((p) => p.id === selectedPkgId) || availablePackages[0];

  const handleAddToCart = () => {
    if (!activePackage) return;
    addItem({
      id: product.id,
      title: product.title,
      price: activePackage.price,
      image: product.image,
      game: product.game,
      selectedTier: activePackage.name
    });
    openCart();
  };

  const currentMedia = mediaList[activeMediaIndex] || { type: 'image', url: product.image };

  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-red-600 selection:text-white pb-24 px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-6 font-medium">
          <Link href="/" className="hover:text-white transition">Anasayfa</Link>
          <span>/</span>
          <Link href="/#games" className="hover:text-white transition uppercase">{product.game}</Link>
          <span>/</span>
          <span className="text-neutral-200 font-bold">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* SOL ALAN: Galeri, Başlık, Açıklama, Sistem Gereksinimleri */}
          <div className="lg:col-span-8 space-y-8">

            {/* Başlık ve Rozetler */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4">
                {product.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/70 border border-emerald-800 text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {product.securityTag || 'Undetected'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-900 border border-neutral-800 text-neutral-300">
                  🪟 {product.systemReqs?.os || 'Windows 10 / 11'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-900 border border-neutral-800 text-neutral-300">
                  ⚡ {product.systemReqs?.cpu || 'Intel / AMD'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-950/40 border border-red-900/50 text-red-400">
                  🚀 Otomatik Teslimat
                </span>
              </div>
            </div>

            {/* Medya Sahnesi */}
            <div className="bg-[#0b0b0e] border border-white/[0.08] rounded-3xl p-3 shadow-2xl overflow-hidden space-y-3">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/[0.05]">
                {currentMedia.type === 'video' ? (
                  currentMedia.url.includes('youtube.com') || currentMedia.url.includes('youtu.be') ? (
                    <iframe
                      src={currentMedia.url.replace('watch?v=', 'embed/')}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={currentMedia.url}
                      controls
                      autoPlay
                      muted
                      loop
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <img
                    src={currentMedia.url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Küçük Resim Slider Şeridi */}
              {mediaList.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-neutral-800">
                  {mediaList.map((m, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveMediaIndex(idx)}
                      className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border transition-all cursor-pointer ${
                        activeMediaIndex === idx
                          ? 'border-red-600 scale-105 shadow-md shadow-red-950'
                          : 'border-white/[0.08] opacity-60 hover:opacity-100'
                      }`}
                    >
                      {m.type === 'video' ? (
                        <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-xs text-red-500 font-bold">
                          ▶ Video
                        </div>
                      ) : (
                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Açıklama */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white tracking-wide">Ürün Açıklaması</h3>
              <div className="text-sm text-neutral-300 leading-relaxed bg-[#0b0b0e] border border-white/[0.06] p-6 rounded-2xl whitespace-pre-line shadow-inner">
                {product.description || 'Bu ürün için detaylı bir açıklama girilmedi.'}
              </div>
            </div>

            {/* Sistem Gereksinimleri */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white tracking-wide">Sistem Uyumluluğu</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0b0b0e] border border-white/[0.06] p-4 rounded-2xl flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-lg">
                    💻
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">İşletim Sistemi</span>
                    <span className="text-sm font-bold text-white">{product.systemReqs?.os || 'Windows 10 / 11 (Tüm Sürümler)'}</span>
                  </div>
                </div>

                <div className="bg-[#0b0b0e] border border-white/[0.06] p-4 rounded-2xl flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-lg">
                    ⚙️
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">İşlemci Mimarisi</span>
                    <span className="text-sm font-bold text-white">{product.systemReqs?.cpu || 'Intel & AMD Uyumlu'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* SAĞ ALAN: Modern ve Canlı Satın Alma / Paket Seçim Kutusu */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-[#0b0b0e]/95 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-[0_10px_40px_rgba(0,0,0,0.8)] space-y-6">
              
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-500 bg-red-950/60 border border-red-800/50 px-3 py-1 rounded-full inline-block">
                  DEXX SHOP GÜVENCESİ
                </span>
                <h2 className="text-2xl font-black text-white mt-3.5">{product.title}</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  İhtiyacınıza uygun paketi seçin ve cüzdan bakiyenizle anında teslim alın.
                </p>
              </div>

              {/* DİNAMİK PAKET SEÇENEKLERİ */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Paket Seçeneği
                </span>

                <div className="space-y-2.5">
                  {availablePackages.map((pkg) => {
                    const isSelected = selectedPkgId === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPkgId(pkg.id)}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                          isSelected
                            ? 'bg-gradient-to-r from-red-950/40 via-red-900/20 to-transparent border-red-600 shadow-[0_0_25px_rgba(220,38,38,0.25)]'
                            : 'bg-black/40 border-white/[0.06] hover:border-white/20 hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            isSelected ? 'border-red-500 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]' : 'border-neutral-700 bg-neutral-900'
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{pkg.name}</span>
                              {pkg.badge && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600/30 border border-red-500/50 text-red-400 tracking-wider">
                                  {pkg.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                              <span className="w-1 h-1 rounded-full bg-emerald-400" />
                              Stok Hazır • Anında Teslim
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-base font-black font-mono tracking-tight ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                            ${Number(pkg.price).toFixed(2)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fiyat & Sepete Ekle */}
              <div className="pt-4 border-t border-white/[0.06] space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-neutral-400 font-medium">Ödenecek Tutar</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white font-mono tracking-tight">
                      ${Number(activePackage?.price || 0).toFixed(2)}
                    </span>
                    <span className="text-xs text-neutral-400 font-bold">USD</span>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-[#ce1818] hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_0_25px_rgba(206,24,24,0.4)] hover:shadow-[0_0_35px_rgba(206,24,24,0.6)] hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🛒 Sepete Ekle & Satın Al</span>
                  <span>→</span>
                </button>
              </div>

              {/* Güvenlik Detayları */}
              <div className="space-y-2 pt-2 text-[11px] text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Satın alma sonrası lisans anında kullanıcı paneline yansır</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>noreply@dexxshop.com üzerinden e-posta teslimatı</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Discord VIP Ticket ile 7/24 kesintisiz kurulum desteği</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}