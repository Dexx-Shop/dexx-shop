"use client";
import Link from "next/link";
import { SparklesCore } from "../ui/sparkles";

export function HeroSection() {
  return (
    <section className="relative w-full min-h-screen bg-black flex flex-col justify-between overflow-hidden select-none pt-28 pb-10">
      
      {/* 1. SOL TARAF: RUST KARAKTERİ */}
      <div className="absolute -left-10 lg:left-0 top-1/2 -translate-y-1/2 w-[380px] sm:w-[480px] lg:w-[580px] h-[750px] pointer-events-none z-0 opacity-40 lg:opacity-60 transition-opacity duration-500">
        <img
          src="/rust-hero.png"
          alt="Rust Character"
          className="w-full h-full object-contain [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] filter contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/30 to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
      </div>

      {/* 2. SAĞ TARAF: FIVEM / GTA KARAKTERİ */}
      <div className="absolute -right-10 lg:right-0 top-1/2 -translate-y-1/2 w-[380px] sm:w-[480px] lg:w-[580px] h-[750px] pointer-events-none z-0 opacity-40 lg:opacity-60 transition-opacity duration-500">
        <img
          src="/fivem-hero.png"
          alt="FiveM Character"
          className="w-full h-full object-contain [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] filter contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/30 to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
      </div>

      {/* 3. MERKEZ HERO ALANI */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center px-4">
        
        {/* Üst Rozet */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-red-500/30 bg-red-950/40 mb-6 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[11px] font-bold tracking-widest uppercase text-red-400">
            OFFICIAL STORE • UNDETECTED SOFTWARE
          </span>
        </div>

        {/* Başlık (Arkadaki aşırı kırmızı parlama ve blur kaldırıldı, netleştirildi) */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-center">
          <span className="text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]">
            DexX
          </span>{" "}
          <span className="bg-gradient-to-b from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent">
            Shop
          </span>
        </h1>

        {/* LAZER ÇİZGİLERİ & DARALTILMIŞ PARÇACIK HAVUZU */}
        <div className="w-[28rem] sm:w-[34rem] md:w-[40rem] h-32 relative -mt-2">
          {/* Lazer Çizgileri (Genişliği yazıya göre dengelendi) */}
          <div className="absolute inset-x-12 top-0 bg-gradient-to-r from-transparent via-red-600 to-transparent h-[2px] w-4/5 mx-auto blur-sm" />
          <div className="absolute inset-x-12 top-0 bg-gradient-to-r from-transparent via-red-500 to-transparent h-px w-4/5 mx-auto" />
          <div className="absolute inset-x-28 top-0 bg-gradient-to-r from-transparent via-rose-400 to-transparent h-[3px] w-1/3 mx-auto blur-sm" />
          <div className="absolute inset-x-28 top-0 bg-gradient-to-r from-transparent via-rose-300 to-transparent h-px w-1/3 mx-auto" />

          {/* Daraltılmış & Yanlardan Yumuşakça Sönen Parçacıklar */}
          <div className="w-full h-full [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_75%)]">
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1.2}
              particleDensity={800}
              className="w-full h-full"
              particleColor="#EF4444"
            />
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <Link
            href="/#products"
            className="px-8 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-tight shadow-[0_0_25px_rgba(239,68,68,0.4)] hover:shadow-[0_0_35px_rgba(239,68,68,0.7)] transition-all transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Ürünleri Keşfet ↓
          </Link>
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 rounded-full border border-white/10 hover:border-red-500/40 bg-[#121216]/70 backdrop-blur-md text-neutral-300 hover:text-white font-bold text-sm tracking-tight transition-all hover:bg-[#18181f]"
          >
            Discord Topluluğu
          </a>
        </div>
      </div>

      {/* 4. ALT GÜVEN KARTLARI */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-6 sm:px-8 mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Güvenli Altyapı */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-red-500/30 transition-colors backdrop-blur-sm">
          <div className="w-11 h-11 rounded-xl bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-500 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <h4 className="text-sm font-bold text-white tracking-tight">Garantili Koruma</h4>
            <p className="text-xs text-neutral-400 mt-0.5">Kernel seviyesinde test edilmiş, güvenli ve bypasslı altyapı.</p>
          </div>
        </div>

        {/* Otomatik Teslimat */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-red-500/30 transition-colors backdrop-blur-sm">
          <div className="w-11 h-11 rounded-xl bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-500 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <h4 className="text-sm font-bold text-white tracking-tight">Anında Otomatik Teslimat</h4>
            <p className="text-xs text-neutral-400 mt-0.5">Ödeme onaylandığı saniye lisans anahtarınız hesabınızda aktif.</p>
          </div>
        </div>

        {/* Canlı Destek */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-red-500/30 transition-colors backdrop-blur-sm">
          <div className="w-11 h-11 rounded-xl bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-500 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v5.018z" />
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <h4 className="text-sm font-bold text-white tracking-tight">7/24 Kesintisiz Destek</h4>
            <p className="text-xs text-neutral-400 mt-0.5">Kurulum ve olası sorunlarda uzman ekibimiz her an yanınızda.</p>
          </div>
        </div>

      </div>

    </section>
  );
}

export default HeroSection;