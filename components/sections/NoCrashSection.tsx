'use client';

import { SparklesCore } from '../ui/sparkles';

export default function NoCrashSection() {
  return (
    <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 select-none overflow-hidden">
      <div className="relative rounded-3xl border border-white/[0.08] bg-[#09090c] overflow-hidden shadow-2xl">
        
        {/* Parçacık Havuzu (Aceternity Sparkles Arka Planı) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <SparklesCore
            background="transparent"
            minSize={0.6}
            maxSize={1.8}
            particleDensity={140}
            className="w-full h-full"
            particleColor="#EF4444"
          />
        </div>

        {/* İçerik Grid (Sol Metin, Sağ Komik Görsel) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 lg:p-14">
          
          {/* SOL: Mizahi ve İddialı Başlık & Metin */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/60 border border-red-800/80 text-red-400 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>STABİL KERNEL DRIVER</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Raid Ortasında <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-500">
                  Mavi Ekran Görmekten
                </span> <br />
                Bıkmadınız mı?
              </h2>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
                Piyasadaki 5 dolarlık optimizasyonsuz hileler tam roket atarken sisteminizi kilitler, bilgisayara roket attırır. 
                <strong className="text-white font-semibold"> DexX Shop</strong> mimarisi sıfır FPS kaybı, temiz bellek yönetimi ve %100 kararlılıkla çalışır. Bilgisayarınız değil, rakipleriniz çöksün.
              </p>
            </div>

            {/* Vurgulu Özellik Rozetleri */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-black/50 border border-white/[0.06] p-3 rounded-2xl">
                <span className="text-emerald-400 font-bold block text-sm">0 Crash</span>
                <span className="text-[11px] text-neutral-400">Kesintisiz Oyun</span>
              </div>
              <div className="bg-black/50 border border-white/[0.06] p-3 rounded-2xl">
                <span className="text-emerald-400 font-bold block text-sm">+0 FPS Kaybı</span>
                <span className="text-[11px] text-neutral-400">Temiz Hook Altyapısı</span>
              </div>
              <div className="bg-black/50 border border-white/[0.06] p-3 rounded-2xl col-span-2 sm:col-span-1">
                <span className="text-emerald-400 font-bold block text-sm">BSOD Koruması</span>
                <span className="text-[11px] text-neutral-400">Kernel Düzeyi İzolasyon</span>
              </div>
            </div>

            {/* Aksiyon Butonu */}
            <div className="pt-2">
              <a
                href="#products"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-red-950/60 hover:scale-[1.02] cursor-pointer"
              >
                <span>Stabil Ürünleri Keşfet</span>
                <span>→</span>
              </a>
            </div>

          </div>

          {/* SAĞ: Roketatar & Mavi Ekran Görsel Çerçevesi */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-[380px] rounded-2xl overflow-hidden border border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.2)] group">
              <img
                src="/rustcrash.png"
                alt="Rust Crash vs DexX Shop"
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500 filter contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
              
              <div className="absolute bottom-3 inset-x-3 text-center">
                <span className="text-[11px] font-bold text-neutral-300 bg-black/80 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                  ❌ Diğer Hileler: <span className="text-red-400 font-mono">CRASH!</span>
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}