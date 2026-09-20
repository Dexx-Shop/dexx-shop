'use client';

import Link from 'next/link';

export default function RelaxBanner() {
  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-[#0c0c10] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
        {/* Arka Plan Görseli */}
        <div 
          className="absolute inset-0 bg-cover bg-center sm:bg-right scale-105 transition-transform duration-1000 hover:scale-100 opacity-80"
          style={{
            backgroundImage: "url('/rustproduct.jpg')", // Resmi public klasörüne rustproduct.jpg ismiyle koyduğundan emin ol
          }}
        />

        {/* Sinematik Gradient Karartma (Sol taraf metin okunurluğu için koyu, sağ taraf resmi gösterir) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent sm:w-3/4" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-black/40" />

        {/* İçerik */}
        <div className="relative z-10 p-8 sm:p-14 lg:p-16 max-w-2xl space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/60 border border-red-800/80 text-red-400 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Zirvede Rahatlık</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              DexX Shop ile <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                Oyuna Hükmedin.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
              Rakipler saatlerce loot yapıp köşelerde pusarken, siz arkanıza yaslanın. Güçlü ESP, kusursuz Silent Aimbot ve güvenli altyapıyla sunucunun tek hakimi olun.
            </p>
          </div>

          {/* Aksiyon Butonları & Küçük Rozetler */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <a
              href="#products"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-red-950/60 hover:scale-[1.02] cursor-pointer"
            >
              Hemen Keşfet →
            </a>
            <Link
              href="/status"
              className="px-6 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-neutral-200 hover:text-white text-xs font-semibold tracking-wide transition backdrop-blur-md"
            >
              🟢 Canlı Mod Durumları
            </Link>
          </div>

          {/* Alt Bilgi Rozeti */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center gap-6 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Kernel Seviye Bypass</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Anında Otomatik Teslimat</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}