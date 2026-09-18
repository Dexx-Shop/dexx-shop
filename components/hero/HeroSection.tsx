"use client";
import { SparklesCore } from "../ui/sparkles";

export function HeroSection() {
  return (
    <section className="relative w-full min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden select-none pt-16">
      
      {/* ÜST ROZET */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-red-500/30 bg-red-950/20 mb-8 backdrop-blur-md z-20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[11px] font-semibold tracking-wider uppercase text-red-400">
          Official Store
        </span>
      </div>

      {/* ANA BAŞLIK */}
      <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-center relative z-20">
        <span className="text-white drop-shadow-[0_2px_20px_rgba(255,255,255,0.2)]">
          DexX
        </span>{" "}
        <span className="bg-gradient-to-b from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(239,68,68,0.8)]">
          Shop
        </span>
      </h1>

      {/* LAZER IŞIKLARI & PARÇACIK HAVUZU */}
      <div className="w-[36rem] sm:w-[48rem] md:w-[56rem] h-48 relative -mt-2">
        {/* Neon Kırmızı Çizgiler */}
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-red-600 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-red-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-rose-400 to-transparent h-[4px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-rose-300 to-transparent h-px w-1/4" />

        {/* Parçacıklar */}
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1.2}
          particleDensity={1000}
          className="w-full h-full"
          particleColor="#EF4444"
        />

        {/* Maske */}
        <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(380px_200px_at_top,transparent_20%,white)] pointer-events-none" />
      </div>

      {/* AŞAĞI KAYDIR GÖSTERGESİ (EKRANIN EN ALTINDA) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 opacity-60 hover:opacity-100 transition-opacity">
        <span className="text-[11px] font-medium tracking-widest text-neutral-400 uppercase">
          Ürünleri Keşfet
        </span>
        <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1">
          <div className="w-1 h-2 rounded-full bg-red-500 animate-bounce" />
        </div>
      </div>

    </section>
  );
}

export default HeroSection;