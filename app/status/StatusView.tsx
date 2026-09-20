'use client';

import { SparklesCore } from 'components/ui/sparkles';
import { Product } from 'lib/products';
import Link from 'next/link';
import { useState } from 'react';

export default function StatusView({ initialProducts }: { initialProducts: Product[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = initialProducts.filter((p) =>
    (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.game || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedGames = filteredProducts.reduce((acc, current) => {
    const gameName = (current.game || 'DİĞER MODLAR').toUpperCase();
    if (!acc[gameName]) {
      acc[gameName] = [];
    }
    acc[gameName].push(current);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white pb-24 px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* ÜST BAŞLIK ALANI */}
        <div className="border-b border-neutral-800/80 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-xs text-red-400 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold tracking-wider text-[11px] uppercase">CANLI SİSTEM DURUMU</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Hizmet & Mod Durumları
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Tüm oyun yazılımlarımızın anlık kernel ve bypass durumu.
            </p>
          </div>

          {/* Durum Renk Açıklamaları */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-400 bg-neutral-950 border border-neutral-800/80 px-4 py-2.5 rounded-2xl">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Güvenli
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Güncelleniyor
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Bakımda
            </span>
          </div>
        </div>

        {/* 2 SÜTUNLU YAPI: SOL ÜRÜN LİSTESİ | SAĞ MİZAH KARTI */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SOL TARAFI: ARAMA + OYUN DURUM TABLOLARI (7 SÜTUN) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Arama Çubuğu */}
            <div className="relative">
              <input
                type="text"
                placeholder="Mod adı veya oyun ara (Örn: Rust, FiveM)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800/90 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 transition shadow-inner"
              />
              <span className="absolute left-4 top-3.5 text-neutral-500 text-sm">🔍</span>
            </div>

            {/* Ürün Listesi */}
            {Object.keys(groupedGames).length === 0 ? (
              <div className="text-center py-16 bg-neutral-950/60 border border-neutral-800/80 rounded-3xl backdrop-blur-md">
                <span className="text-3xl block mb-2">📦</span>
                <p className="text-neutral-400 text-sm">Eşleşen aktif mod veya oyun bulunamadı.</p>
              </div>
            ) : (
              Object.entries(groupedGames).map(([gameName, items]) => (
                <div
                  key={gameName}
                  className="bg-neutral-950/60 border border-neutral-800/80 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl"
                >
                  <div className="px-5 py-3.5 border-b border-neutral-800/80 bg-black/40 flex items-center justify-between">
                    <h2 className="font-black text-sm sm:text-base text-white tracking-wider uppercase flex items-center gap-2">
                      <span className="text-red-500">•</span>
                      <span>{gameName}</span>
                    </h2>
                    <span className="text-[11px] font-bold text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-0.5 rounded-lg">
                      {items.length} Mod Aktif
                    </span>
                  </div>

                  <div className="divide-y divide-neutral-900">
                    {items.map((item) => {
                      const statusVal = (item.status || '').toLowerCase();
                      const securityTagVal = (item.securityTag || '').toLowerCase();

                      const isUpdating = statusVal === 'updating';
                      const isInactive = statusVal === 'inactive';
                      const isSafe = !isUpdating && !isInactive && (statusVal === 'active' || securityTagVal.includes('undetected') || !statusVal);

                      return (
                        <div
                          key={item.id}
                          className="p-4 sm:px-5 flex items-center justify-between gap-3 hover:bg-neutral-900/40 transition duration-150"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={item.image || 'https://via.placeholder.com/100'}
                              alt={item.title}
                              className="w-10 h-10 rounded-xl object-cover bg-neutral-900 border border-neutral-800 shrink-0"
                            />
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-white truncate">
                                {item.title}
                              </h3>
                              <span className="text-[11px] text-neutral-400 block truncate">
                                {item.securityTag || 'Undetected'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            {isSafe && (
                              <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                GÜVENLİ
                              </span>
                            )}
                            {isUpdating && (
                              <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-amber-950/70 border border-amber-800/80 text-amber-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                GÜNCELLENİYOR
                              </span>
                            )}
                            {isInactive && (
                              <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-red-950/70 border border-red-800/80 text-red-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                BAKIMDA
                              </span>
                            )}

                            <Link
                              href={`/product/${item.id}`}
                              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition flex items-center gap-1 shadow-md shadow-red-950"
                            >
                              <span>Satın Al</span>
                              <span>→</span>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}

          </div>

          {/* SAĞ TARAFI: STICKY MİZAH & GÜVEN KARTI (5 SÜTUN) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="relative rounded-3xl border border-white/[0.08] bg-[#0c0c10] overflow-hidden shadow-2xl p-6 sm:p-7">
              
              {/* Arka Plan Parçacık Animasyonu */}
              <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <SparklesCore
                  background="transparent"
                  minSize={0.6}
                  maxSize={1.4}
                  particleDensity={70}
                  className="w-full h-full"
                  particleColor="#EF4444"
                />
              </div>

              <div className="relative z-10 space-y-5">
                
                {/* Rozet */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/80 text-red-400 text-[10px] font-bold tracking-wider uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>%100 KERNEL STABİLİTE</span>
                </div>

                {/* Başlık */}
                <div className="space-y-1.5">
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    Raid Ortasında Mavi Ekran Görmekten Bıkmadınız mı?
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Piyasadaki kalitesiz modlar tam roket atarken bilgisayarınızı kilitler. DexX Shop altyapısında bellek sızıntısı ve crash sıfıra indirilmiştir. Bilgisayarınız değil, rakipleriniz çöksün.
                  </p>
                </div>

                {/* Komik Görsel */}
                <div className="relative rounded-2xl overflow-hidden border border-red-500/30 shadow-[0_0_25px_rgba(239,68,68,0.2)] group">
                  <img
                    src="/rustcrash.png"
                    alt="Rust Crash vs DexX Shop"
                    className="w-full h-48 sm:h-56 object-cover filter contrast-110 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
                  <div className="absolute bottom-2.5 inset-x-2 text-center">
                    {/* <span className="text-[11px] font-bold text-neutral-200 bg-black/80 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                      ❌ Diğer Hileler: <span className="text-red-400 font-mono">BSOD / CRASH!</span>
                    </span> */}
                  </div>
                </div>

                {/* 3'lü Güven Maddeleri */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="bg-black/50 border border-white/[0.06] p-2.5 rounded-xl">
                    <span className="text-emerald-400 font-bold block text-xs">0 Crash</span>
                    <span className="text-[10px] text-neutral-400">Kesintisiz</span>
                  </div>
                  <div className="bg-black/50 border border-white/[0.06] p-2.5 rounded-xl">
                    <span className="text-emerald-400 font-bold block text-xs">0 FPS Drop</span>
                    <span className="text-[10px] text-neutral-400">Akıcı</span>
                  </div>
                  <div className="bg-black/50 border border-white/[0.06] p-2.5 rounded-xl">
                    <span className="text-emerald-400 font-bold block text-xs">Kernel Hook</span>
                    <span className="text-[10px] text-neutral-400">İzole</span>
                  </div>
                </div>

                {/* Buton
                <Link
                  href="/#products"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-red-950/60 block text-center cursor-pointer"
                >
                  Güvenli Modları İncele →
                </Link> */}

              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}