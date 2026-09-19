'use client';

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
    // pt-28 sm:pt-36 eklenerek sabit navbarın arkasında kalması engellendi
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white pb-24 px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36">
      <div className="max-w-4xl mx-auto text-center pb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 mb-6 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
          <span className="font-semibold uppercase tracking-wider text-[11px]">ÜRÜN DURUMU</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
          Ürün Durumu
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Tüm ürünlerimizin anlık durumu. Modunuzun güvenli, güncelleniyor veya bakımda olduğunu buradan kontrol edin.
        </p>

        <div className="max-w-md mx-auto mt-8 relative">
          <input
            type="text"
            placeholder="Ürün veya oyun ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-900/90 border border-neutral-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 transition shadow-inner"
          />
          <span className="absolute left-4 top-3.5 text-neutral-500 text-sm">🔍</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 text-xs text-neutral-400 font-medium">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Güvenli
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Güncelleniyor
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Güvenli Değil / Bakımda
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {Object.keys(groupedGames).length === 0 ? (
          <div className="text-center py-16 bg-neutral-900/40 border border-neutral-800/80 rounded-3xl backdrop-blur-md">
            <p className="text-neutral-400 text-sm">Eşleşen mod veya ürün bulunamadı.</p>
          </div>
        ) : (
          Object.entries(groupedGames).map(([gameName, items]) => (
            <div
              key={gameName}
              className="bg-neutral-900/40 border border-neutral-800/80 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-neutral-800/80 bg-neutral-950/40 flex items-center justify-between">
                <h2 className="font-extrabold text-base sm:text-lg text-white tracking-wide uppercase flex items-center gap-2">
                  <span className="text-red-500">•</span>
                  <span>{gameName}</span>
                </h2>
                <span className="text-xs text-neutral-500 font-mono">
                  {items.length} Mod
                </span>
              </div>

              <div className="divide-y divide-neutral-800/60">
                {items.map((item) => {
                  const statusVal = (item.status || '').toLowerCase();
                  const securityTagVal = (item.securityTag || '').toLowerCase();

                  // Durum kontrolü: 'active' ise veya status belirtilmemişken tag 'undetected' ise güvenli kabul et
                  const isUpdating = statusVal === 'updating';
                  const isInactive = statusVal === 'inactive';
                  const isSafe = !isUpdating && !isInactive && (statusVal === 'active' || securityTagVal.includes('undetected') || !statusVal);

                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-neutral-800/20 transition duration-150"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={item.image || 'https://via.placeholder.com/100'}
                          alt={item.title}
                          className="w-11 h-11 rounded-xl object-cover bg-neutral-950 border border-neutral-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-bold text-white truncate">
                            {item.title}
                          </h3>
                          <span className="text-[11px] text-neutral-500 block truncate">
                            {item.securityTag || 'Undetected'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {isSafe && (
                          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            GÜVENLİ
                          </span>
                        )}
                        {isUpdating && (
                          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-950/70 border border-amber-800/80 text-amber-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            GÜNCELLENİYOR
                          </span>
                        )}
                        {isInactive && (
                          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-950/70 border border-red-800/80 text-red-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                            GÜVENLİ DEĞİL / BAKIMDA
                          </span>
                        )}

                        <Link
                          href={`/product/${item.id}`}
                          className="text-xs font-bold px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition flex items-center gap-1.5 shadow-md shadow-red-950"
                        >
                          <span>🛒</span>
                          <span className="hidden sm:inline">Satın Al</span>
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
    </div>
  );
}