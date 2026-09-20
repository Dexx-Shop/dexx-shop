"use client";

import { LayoutTextFlip } from "components/ui/layout-text-flip";
import Link from "next/link";

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
  // Rust Ürünleri & Başlangıç Fiyatı Hesabı
  const rustProducts = products.filter((p) => {
    const game = (p.game || "").toLowerCase();
    const title = (p.title || "").toLowerCase();
    return game.includes("rust") || title.includes("rust");
  });

  const rustPrices = rustProducts
    .map((p) => Number(p.pricing?.daily || p.pricing?.weekly || p.pricing?.monthly || 0))
    .filter((price) => price > 0);
  const rustMinPrice = rustPrices.length > 0 ? Math.min(...rustPrices) : 0;

  // FiveM Ürünleri & Başlangıç Fiyatı Hesabı
  const fivemProducts = products.filter((p) => {
    const game = (p.game || "").toLowerCase();
    const title = (p.title || "").toLowerCase();
    return game.includes("fivem") || game.includes("gta") || title.includes("fivem") || title.includes("gta");
  });

  const fivemPrices = fivemProducts
    .map((p) => Number(p.pricing?.daily || p.pricing?.weekly || p.pricing?.monthly || 0))
    .filter((price) => price > 0);
  const fivemMinPrice = fivemPrices.length > 0 ? Math.min(...fivemPrices) : 0;

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

      {/* 1. OYUN KATEGORİ KARTLARI (RUST & FIVEM DİREKT LİNK) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto justify-items-center">
        
        {/* RUST KART - /category/rust YÖNLENDİRMESİ */}
        <Link
          href="/category/rust"
          className="group relative w-full max-w-[340px] h-[450px] rounded-3xl overflow-hidden select-none transition-all duration-300 transform hover:scale-[1.03] border border-white/[0.08] hover:border-red-500 shadow-2xl hover:shadow-[0_0_35px_rgba(239,68,68,0.4)] block"
        >
          <img
            src="/rust-hero.png"
            alt="Rust Cheats"
            className="absolute inset-0 w-full h-full object-cover filter contrast-125 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-red-950/15 mix-blend-color" />

          {/* Orta Kategori Başlığı */}
          <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
            <h3 className="text-4xl font-black tracking-wider uppercase text-neutral-100 drop-shadow-[0_4px_15px_rgba(0,0,0,0.9)] group-hover:text-red-500 transition-colors">
              RUST
            </h3>
          </div>

          {/* Alt Bilgi Çubuğu */}
          <div className="absolute bottom-0 inset-x-0 p-6 flex items-end justify-between bg-gradient-to-t from-black/95 via-black/80 to-transparent">
            <div className="flex flex-col text-left">
              <span className="text-lg font-extrabold text-white tracking-tight">Rust Cheats</span>
              <span className="text-xs font-semibold text-neutral-400 mt-0.5">{rustProducts.length} Ürün Listele →</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Starting</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">${rustMinPrice > 0 ? rustMinPrice.toFixed(2) : "0.00"}</span>
                <span className="text-xs font-bold text-red-500">USD</span>
              </div>
            </div>
          </div>
        </Link>

        {/* FIVEM KART - /category/fivem YÖNLENDİRMESİ */}
        <Link
          href="/category/fivem"
          className="group relative w-full max-w-[340px] h-[450px] rounded-3xl overflow-hidden select-none transition-all duration-300 transform hover:scale-[1.03] border border-white/[0.08] hover:border-red-500 shadow-2xl hover:shadow-[0_0_35px_rgba(239,68,68,0.4)] block"
        >
          <img
            src="/fivem-hero2.png"
            alt="FiveM Cheats"
            className="absolute inset-0 w-full h-full object-cover filter contrast-125 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-red-950/15 mix-blend-color" />

          {/* Orta Kategori Başlığı */}
          <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
            <h3 className="text-4xl font-black tracking-wider uppercase text-neutral-100 drop-shadow-[0_4px_15px_rgba(0,0,0,0.9)] group-hover:text-red-500 transition-colors">
              FIVEM
            </h3>
          </div>

          {/* Alt Bilgi Çubuğu */}
          <div className="absolute bottom-0 inset-x-0 p-6 flex items-end justify-between bg-gradient-to-t from-black/95 via-black/80 to-transparent">
            <div className="flex flex-col text-left">
              <span className="text-lg font-extrabold text-white tracking-tight">FiveM Cheats</span>
              <span className="text-xs font-semibold text-neutral-400 mt-0.5">{fivemProducts.length} Ürün Listele →</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Starting</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">${fivemMinPrice > 0 ? fivemMinPrice.toFixed(2) : "0.00"}</span>
                <span className="text-xs font-bold text-red-500">USD</span>
              </div>
            </div>
          </div>
        </Link>

      </div>
    </main>
  );
}