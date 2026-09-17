import fs from 'fs';
import Link from 'next/link';
import path from 'path';

function getHeroSettings() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'settings.json');
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch {}
  return {
    heroBadge: 'DexX Kernel v2.4 Yayında',
    heroUserCount: '2,000+'
  };
}

export default function HeroSection() {
  const settings = getHeroSettings();

  return (
    <section className="relative w-full min-h-[75vh] flex flex-col items-center justify-center text-center px-4 pt-20 pb-16 overflow-hidden">
      
      {/* 1. ARKA PLAN: SOĞUK DUMAN VE SİS */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-[680px] h-[380px] rounded-full blur-[140px] opacity-20 bg-gradient-to-t from-neutral-200 via-neutral-400 to-transparent animate-smoke pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_45%,transparent_20%,#080809_85%)]" />
      </div>

      {/* 2. İÇERİK BLOĞU */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Üst Hap Rozet (Admin Panelden Değiştirilebilir) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md mb-8 hover:border-white/[0.15] transition shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-normal text-neutral-300 tracking-tight">
            {settings.heroBadge || 'DexX Kernel v2.4 Yayında'}
          </span>
        </div>

        {/* Devasa Başlık */}
        <h1 className="text-4xl sm:text-6xl lg:text-[76px] font-semibold tracking-[-0.035em] leading-[1.04] text-white">
          Daha hızlı teslim. <br />
          <span className="text-neutral-500 font-medium">Sessizce ve güvenle yönetin.</span>
        </h1>

        {/* Açıklama Yazısı */}
        <p className="mt-6 text-sm sm:text-base text-neutral-400 max-w-xl font-normal leading-relaxed">
          En zorlu güvenlik altyapıları için geliştirilmiş; sıfır gecikme, donanım kimliği koruması ve anında teslim VIP lisans çözümleri.
        </p>

        {/* Eylem Butonları */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#products"
            className="px-6 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-semibold tracking-tight transition flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.12)] group"
          >
            <span>Ürünleri İnceleyin</span>
            <span className="text-neutral-500 group-hover:translate-x-0.5 transition-transform">→</span>
          </a>

          <Link
            href="/profile"
            className="px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] text-neutral-300 hover:text-white text-xs font-medium tracking-tight transition backdrop-blur-sm"
          >
            Konsol Girişi
          </Link>
        </div>

        {/* Alt Güven Rozeti (Avatarlar Kaldırıldı, Sadece Minimalist Sayaç) */}
        <div className="mt-12 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.05]">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
          <p className="text-xs text-neutral-500 font-normal">
            Platform genelinde <span className="text-neutral-200 font-medium">{settings.heroUserCount || '2,000+'}</span> aktif lisanslı kullanıcı
          </p>
        </div>

      </div>
    </section>
  );
}