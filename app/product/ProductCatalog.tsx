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
  packages?: Array<{ price: number }>;
  pricing?: {
    daily?: number;
    weekly?: number;
    monthly?: number;
    lifetime?: number;
  };
  [key: string]: any;
}

export function ProductCatalog({ products = [] }: { products: Product[] }) {
  // En düşük fiyatı hem packages hem de pricing üzerinden hesaplayan yardımcı fonksiyon
  const getMinPrice = (gameKey: string) => {
    const matchedProducts = products.filter((p) => {
      const game = (p.game || "").toLowerCase();
      const title = (p.title || "").toLowerCase();
      return game.includes(gameKey) || title.includes(gameKey);
    });

    const prices: number[] = [];

    matchedProducts.forEach((p) => {
      if (p.packages && Array.isArray(p.packages) && p.packages.length > 0) {
        p.packages.forEach((pkg) => {
          if (pkg.price && Number(pkg.price) > 0) prices.push(Number(pkg.price));
        });
      }
      if (p.pricing) {
        const legacyPrices = [
          p.pricing.daily,
          p.pricing.weekly,
          p.pricing.monthly,
          p.pricing.lifetime,
        ]
          .map(Number)
          .filter((val) => val > 0);
        prices.push(...legacyPrices);
      }
    });

    return {
      count: matchedProducts.length,
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
    };
  };

  const rustData = getMinPrice("rust");
  const fivemData = getMinPrice("fivem");
  const valorantData = getMinPrice("valorant");
  const fortniteData = getMinPrice("fortnite");

  const categories = [
    {
      id: "rust",
      title: "RUST",
      subtitle: "Rust Cheats",
      href: "/category/rust",
      image: "/rust-hero.png",
      count: rustData.count,
      price: rustData.minPrice,
    },
    {
      id: "fivem",
      title: "FIVEM",
      subtitle: "FiveM Cheats",
      href: "/category/fivem",
      image: "/fivem-hero2.png",
      count: fivemData.count,
      price: fivemData.minPrice,
    },
    {
      id: "valorant",
      title: "VALORANT",
      subtitle: "Valorant Cheats",
      href: "/category/valorant",
      image: "/valorant-hero.png",
      count: valorantData.count,
      price: valorantData.minPrice,
    },
    {
      id: "fortnite",
      title: "FORTNITE",
      subtitle: "Fortnite Cheats",
      href: "/category/fortnite",
      image: "/fortnite-hero.jpg",
      count: fortniteData.count,
      price: fortniteData.minPrice,
    },
  ];

  return (
    <main id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.06]">
      
      {/* Başlık ve Flip Animasyonu */}
      <div className="flex flex-col items-center justify-center text-center mb-16 select-none relative">
        <LayoutTextFlip
          text="Mevcut"
          words={["Kategoriler", "Hileler", "Yazılımlar"]}
          duration={2500}
        />

        {/* Neon Çizgi */}
        <div className="relative w-64 sm:w-80 h-[2px] mt-5">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600 to-transparent h-full w-full blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500 to-transparent h-px w-full" />
        </div>
      </div>

      {/* 4'lü Yan Yana Kategori Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={cat.href}
            className="group relative w-full max-w-[310px] h-[440px] rounded-3xl overflow-hidden select-none transition-all duration-300 transform hover:scale-[1.03] border border-white/[0.08] hover:border-red-500 shadow-2xl hover:shadow-[0_0_35px_rgba(239,68,68,0.4)] block"
          >
            <img
              src={cat.image}
              alt={cat.subtitle}
              className="absolute inset-0 w-full h-full object-cover filter contrast-125 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-red-950/15 mix-blend-color" />

            {/* Kategori Başlığı */}
            <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
              <h3 className="text-3xl font-black tracking-wider uppercase text-neutral-100 drop-shadow-[0_4px_15px_rgba(0,0,0,0.9)] group-hover:text-red-500 transition-colors text-center">
                {cat.title}
              </h3>
            </div>

            {/* Alt Bilgi */}
            <div className="absolute bottom-0 inset-x-0 p-5 flex items-end justify-between bg-gradient-to-t from-black/95 via-black/80 to-transparent">
              <div className="flex flex-col text-left">
                <span className="text-base font-extrabold text-white tracking-tight">{cat.subtitle}</span>
                <span className="text-xs font-semibold text-neutral-400 mt-0.5">{cat.count} Ürün Listele →</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Starting</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-white">
                    ${cat.price > 0 ? cat.price.toFixed(2) : "0.00"}
                  </span>
                  <span className="text-[11px] font-bold text-red-500">USD</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}