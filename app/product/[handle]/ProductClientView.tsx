'use client';

import { useCart } from 'lib/cart';
import { Product } from 'lib/products';
import Link from 'next/link';
import { useState } from 'react';

export default function ProductClientView({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();

  // Medya Havuzu: Video + Fotoğraflar
  const initialMedia = [];
  if (product.videoUrl) initialMedia.push({ type: 'video', url: product.videoUrl });
  if (product.media && product.media.length > 0) {
    product.media.forEach((m) => initialMedia.push({ type: 'image', url: m }));
  } else if (product.image) {
    initialMedia.push({ type: 'image', url: product.image });
  }

  const [mediaList] = useState(initialMedia);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // Paket Seçimi
  const [selectedTier, setSelectedTier] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [openFeatureCategory, setOpenFeatureCategory] = useState<string | null>('Aimbot');

  const prices = {
    daily: product.pricing?.daily || 0,
    weekly: product.pricing?.weekly || 0,
    monthly: product.pricing?.monthly || 0,
  };

  const activePrice = prices[selectedTier];

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: activePrice,
      image: product.image,
      game: product.game,
      selectedTier: selectedTier === 'daily' ? 'Günlük' : selectedTier === 'weekly' ? 'Haftalık' : 'Aylık'
    });
    openCart();
  };

  const currentMedia = mediaList[activeMediaIndex] || { type: 'image', url: product.image };

  // Varsayılan Özellik Şablonu (Admin panelden gelmezse gösterilecek dolu liste)
  const defaultFeatures = [
    {
      title: 'Silent Aimbot',
      items: ['Target (Crosshair, Distance)', 'FOV Slider', 'Hit Rate Control', 'Only Visible', 'Bone Selection (Head, Neck, Chest)', 'Show FOV Circle']
    },
    {
      title: 'Player Visuals (ESP)',
      items: ['Box ESP (2D/Corner)', 'Skeleton ESP', 'Health Bar', 'Distance ESP', 'Snaplines', 'Player Names & Weapons', 'Sleeper ESP']
    },
    {
      title: 'World & Radar',
      items: ['Ore ESP (Sulfur, Metal, Stone)', 'Crate & Loot ESP', 'Dropped Items', 'Custom Mini-Radar', 'Air Drop Tracking']
    },
    {
      title: 'Misc & Exploit',
      items: ['No Recoil (Slider %)', 'No Spread', 'Always Day', 'Fast Bow', 'Spiderman / Climb Assist', 'Admin Flag Exploit']
    }
  ];

  const displayFeatures = product.features && product.features.length > 0 ? product.features : defaultFeatures;

  return (
    <div className="min-h-screen bg-[#070709] text-white selection:bg-red-600 selection:text-white pb-24 px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36">
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

          {/* SOL ALAN: Galeri, Başlık, Özellikler (8 Kolon) */}
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
                  🚀 Anında Teslimat
                </span>
              </div>
            </div>

            {/* Harman Tarzı Medya Sahnesi */}
            <div className="bg-[#0b0b0e] border border-white/[0.08] rounded-3xl p-3 shadow-2xl overflow-hidden space-y-3">
              {/* Ana Ekran */}
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
              <h3 className="text-lg font-bold text-white tracking-wide">Açıklama</h3>
              <p className="text-sm text-neutral-400 leading-relaxed bg-[#0b0b0e] border border-white/[0.06] p-5 rounded-2xl">
                {product.description || 'Bu mod için detaylı bir açıklama girilmedi.'}
              </p>
            </div>

            {/* Özellikler (Accordion / Harman Tarzı Tag Grupları) */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white tracking-wide">Özellikler & Detaylar</h3>
              <div className="space-y-2.5">
                {displayFeatures.map((cat, idx) => {
                  const isOpen = openFeatureCategory === cat.title;
                  return (
                    <div
                      key={idx}
                      className="bg-[#0b0b0e] border border-white/[0.06] rounded-2xl overflow-hidden transition"
                    >
                      <button
                        onClick={() => setOpenFeatureCategory(isOpen ? null : cat.title)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-sm text-white hover:bg-white/[0.02] cursor-pointer"
                      >
                        <span>{cat.title}</span>
                        <span className="text-xs text-neutral-500">{isOpen ? '▲' : '▼'}</span>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 border-t border-white/[0.04] flex flex-wrap gap-2">
                          {cat.items.map((feat, fIdx) => (
                            <span
                              key={fIdx}
                              className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/[0.08] text-xs text-neutral-300 font-medium"
                            >
                              {feat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sistem Gereksinimleri */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white tracking-wide">Sistem Gereksinimleri</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0b0b0e] border border-white/[0.06] p-4 rounded-2xl flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-lg">
                    💻
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">İşletim Sistemi</span>
                    <span className="text-sm font-bold text-white">{product.systemReqs?.os || 'Windows 10 / 11'}</span>
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

          {/* SAĞ ALAN: Sticky Satın Alma Kutusu (4 Kolon) */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-[#0b0b0e] border border-white/[0.08] rounded-3xl p-6 shadow-2xl space-y-6">
              
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-950/60 border border-red-900/60 px-2.5 py-1 rounded-full">
                  ORİJİNAL LİSANS
                </span>
                <h2 className="text-2xl font-black text-white mt-3">{product.title}</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Kullanım sürenizi belirleyin ve cüzdan bakiyenizle anında satın alın.
                </p>
              </div>

              {/* Lisans Seçenekleri */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Paket Seçin
                </span>

                {/* Günlük */}
                <button
                  onClick={() => setSelectedTier('daily')}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                    selectedTier === 'daily'
                      ? 'bg-red-950/20 border-red-600 shadow-md shadow-red-950/40'
                      : 'bg-black/50 border-white/[0.06] hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedTier === 'daily' ? 'border-red-500 bg-red-600' : 'border-neutral-600'
                    }`}>
                      {selectedTier === 'daily' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">1 Günlük</span>
                      <span className="text-[10px] text-emerald-400">Stok Hazır</span>
                    </div>
                  </div>
                  <span className="text-sm font-black font-mono text-white">${prices.daily}</span>
                </button>

                {/* Haftalık */}
                <button
                  onClick={() => setSelectedTier('weekly')}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                    selectedTier === 'weekly'
                      ? 'bg-red-950/20 border-red-600 shadow-md shadow-red-950/40'
                      : 'bg-black/50 border-white/[0.06] hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedTier === 'weekly' ? 'border-red-500 bg-red-600' : 'border-neutral-600'
                    }`}>
                      {selectedTier === 'weekly' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">1 Haftalık</span>
                        <span className="text-[9px] bg-red-650 px-1.5 py-0.2 rounded text-red-400 font-bold">Popüler</span>
                      </div>
                      <span className="text-[10px] text-emerald-400">Stok Hazır</span>
                    </div>
                  </div>
                  <span className="text-sm font-black font-mono text-white">${prices.weekly}</span>
                </button>

                {/* Aylık */}
                <button
                  onClick={() => setSelectedTier('monthly')}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                    selectedTier === 'monthly'
                      ? 'bg-red-950/20 border-red-600 shadow-md shadow-red-950/40'
                      : 'bg-black/50 border-white/[0.06] hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedTier === 'monthly' ? 'border-red-500 bg-red-600' : 'border-neutral-600'
                    }`}>
                      {selectedTier === 'monthly' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">1 Aylık</span>
                      <span className="text-[10px] text-emerald-400">En Avantajlı</span>
                    </div>
                  </div>
                  <span className="text-sm font-black font-mono text-white">${prices.monthly}</span>
                </button>
              </div>

              {/* Fiyat & Sepete Ekle Butonları */}
              <div className="pt-3 border-t border-white/[0.06] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400 font-medium">Ödenecek Tutar</span>
                  <span className="text-3xl font-black text-white font-mono">${activePrice} <span className="text-sm text-neutral-400">USD</span></span>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-red-950 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🛒 Sepete Ekle & Satın Al</span>
                  <span>→</span>
                </button>
              </div>

              {/* Garanti / Güvenlik Şeridi */}
              <div className="space-y-2 pt-2 text-[11px] text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Anında Otomatik Sipariş Kodu Üretimi</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>7/24 Discord VIP Ticket & Kurulum Desteği</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>En Güncel Undetected Sürümler</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}