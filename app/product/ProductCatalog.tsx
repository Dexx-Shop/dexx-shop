"use client";

import { CometCard } from "components/ui/comet-card";
import { LayoutTextFlip } from "components/ui/layout-text-flip";
import Link from "next/link";
import { useState } from "react";

interface Product {
  id: string;
  title: string;
  description?: string;
  game?: string;
  image?: string;
  securityTag?: string;
  pricing?: {
    daily?: number;
    weekly?: number;
    monthly?: number;
    lifetime?: number;
  };
  [key: string]: any;
}

export function ProductCatalog({ products = [] }: { products: Product[] }) {
  const [selectedGame, setSelectedGame] = useState<string>("rust");

  // Rust Ürünlerini Filtrele
  const rustProducts = products.filter((p) => {
    const game = (p.game || "").toLowerCase();
    const title = (p.title || "").toLowerCase();
    return game.includes("rust") || title.includes("rust");
  });

  // Rust Başlangıç Fiyatı
  const rustPrices = rustProducts
    .map((p) => Number(p.pricing?.daily || p.pricing?.weekly || p.pricing?.monthly || 0))
    .filter((price) => price > 0);
  const rustMinPrice = rustPrices.length > 0 ? Math.min(...rustPrices) : 0;

  // FiveM Ürünlerini Filtrele
  const fivemProducts = products.filter((p) => {
    const game = (p.game || "").toLowerCase();
    const title = (p.title || "").toLowerCase();
    return game.includes("fivem") || game.includes("gta") || title.includes("fivem") || title.includes("gta");
  });

  // FiveM Başlangıç Fiyatı
  const fivemPrices = fivemProducts
    .map((p) => Number(p.pricing?.daily || p.pricing?.weekly || p.pricing?.monthly || 0))
    .filter((price) => price > 0);
  const fivemMinPrice = fivemPrices.length > 0 ? Math.min(...fivemPrices) : 0;

  const activeProducts = selectedGame === "rust" ? rustProducts : fivemProducts;

  return (
    <main id="products" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.06]">
      
      {/* Başlık ve Flip Animasyonu */}
      <div className="flex flex-col items-center justify-center text-center mb-16 select-none relative">
        <LayoutTextFlip
          text="Mevcut"
          words={["Kategoriler", "Hileler", "Yazılımlar"]}
          duration={2500}
        />

        {/* İnce Neon Çizgi */}
        <div className="relative w-64 sm:w-80 h-[2px] mt-5">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600 to-transparent h-full w-full blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500 to-transparent h-px w-full" />
        </div>
      </div>

      {/* 1. OYUN KATEGORİ KARTLARI (RUST & FIVEM) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-20 justify-items-center">
        
        {/* RUST KART */}
        <div
          onClick={() => setSelectedGame("rust")}
          className={`relative w-full max-w-[340px] h-[450px] rounded-3xl overflow-hidden cursor-pointer select-none transition-all duration-300 transform hover:scale-[1.02] border ${
            selectedGame === "rust"
              ? "border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.4)]"
              : "border-white/[0.08] hover:border-red-500/50 shadow-2xl opacity-80 hover:opacity-100"
          }`}
        >
          <img
            src="/rust-hero.png"
            alt="Rust Cheats"
            className="absolute inset-0 w-full h-full object-cover filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-red-950/15 mix-blend-color" />

          <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
            <h3 className="text-4xl font-black tracking-wider uppercase text-neutral-100 drop-shadow-[0_4px_15px_rgba(0,0,0,0.9)]">
              RUST
            </h3>
          </div>

          <div className="absolute bottom-0 inset-x-0 p-6 flex items-end justify-between bg-gradient-to-t from-black/95 via-black/80 to-transparent">
            <div className="flex flex-col text-left">
              <span className="text-lg font-extrabold text-white tracking-tight">Rust Cheats</span>
              <span className="text-xs font-semibold text-neutral-400 mt-0.5">{rustProducts.length} Ürün</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Starting</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">${rustMinPrice > 0 ? rustMinPrice.toFixed(2) : "0.00"}</span>
                <span className="text-xs font-bold text-red-500">USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* FIVEM KART */}
        <div
          onClick={() => setSelectedGame("fivem")}
          className={`relative w-full max-w-[340px] h-[450px] rounded-3xl overflow-hidden cursor-pointer select-none transition-all duration-300 transform hover:scale-[1.02] border ${
            selectedGame === "fivem"
              ? "border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.4)]"
              : "border-white/[0.08] hover:border-red-500/50 shadow-2xl opacity-80 hover:opacity-100"
          }`}
        >
          <img
            src="/fivem-hero.png"
            alt="FiveM Cheats"
            className="absolute inset-0 w-full h-full object-cover filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-red-950/15 mix-blend-color" />

          <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
            <h3 className="text-4xl font-black tracking-wider uppercase text-neutral-100 drop-shadow-[0_4px_15px_rgba(0,0,0,0.9)]">
              FIVEM
            </h3>
          </div>

          <div className="absolute bottom-0 inset-x-0 p-6 flex items-end justify-between bg-gradient-to-t from-black/95 via-black/80 to-transparent">
            <div className="flex flex-col text-left">
              <span className="text-lg font-extrabold text-white tracking-tight">FiveM Cheats</span>
              <span className="text-xs font-semibold text-neutral-400 mt-0.5">{fivemProducts.length} Ürün</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Starting</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">${fivemMinPrice > 0 ? fivemMinPrice.toFixed(2) : "0.00"}</span>
                <span className="text-xs font-bold text-red-500">USD</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 2. SEÇİLEN KATEGORİ BAŞLIĞI */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-8">
        <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span>{selectedGame === "rust" ? "Rust Ürünleri" : "FiveM Ürünleri"}</span>
        </h3>
        <span className="text-xs sm:text-sm font-semibold text-neutral-400">
          {activeProducts.length} ürün listeleniyor
        </span>
      </div>

      {/* 3. COMET ÜRÜN KARTLARI */}
      {activeProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeProducts.map((product) => {
            const productSlug = (product as any).handle || product.id;
            const startPrice =
              product.pricing?.daily ||
              product.pricing?.weekly ||
              product.pricing?.monthly ||
              0;

            return (
              <CometCard key={product.id} className="w-full">
                <Link
                  href={`/product/${productSlug}`}
                  className="group relative bg-[#0e0e11] hover:bg-[#131317] border border-white/[0.08] hover:border-red-600/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-2xl block h-full"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-950">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">
                        Görsel Yok
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3 z-10">
                      <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-black/80 border border-white/10 text-neutral-200 backdrop-blur-md">
                        {product.game || selectedGame.toUpperCase()}
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-transparent to-transparent opacity-80" />
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-white tracking-tight group-hover:text-red-500 transition-colors">
                          {product.title}
                        </h3>
                        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {product.securityTag || 'Undetected'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed font-medium">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-3.5 border-t border-white/[0.06] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold block">
                          Başlangıç
                        </span>
                        <span className="text-base font-black text-white tracking-tight">
                          ${Number(startPrice).toFixed(2)}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-neutral-300 group-hover:text-red-400 group-hover:translate-x-1 transition-all flex items-center gap-1">
                        <span>İncele</span>
                        <span>→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </CometCard>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border border-white/[0.05] rounded-3xl bg-white/[0.01]">
          <p className="text-neutral-400 text-sm font-semibold">Bu kategoriye ait henüz bir ürün eklenmemiş.</p>
        </div>
      )}
    </main>
  );
}