import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-neutral-800/80 bg-[#09090b] text-neutral-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Logo ve Marka Bilgisi */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="DexX Shop Logo"
            className="w-10 h-10 object-contain filter drop-shadow-[0_0_10px_rgba(239,68,68,0.35)]"
          />
          <div>
            <span className="text-white font-black tracking-wider text-sm block">DexX Shop</span>
            <span className="text-[11px] text-neutral-500">Premium Mod & Gaming Solutions</span>
          </div>
        </div>

        {/* Linkler */}
        <div className="flex items-center gap-6 text-xs font-medium">
          <Link href="/terms" className="hover:text-white transition">Kullanım Koşulları</Link>
          <Link href="/privacy" className="hover:text-white transition">Gizlilik Politikası</Link>
          <Link href="/support" className="hover:text-white transition">Destek / Discord</Link>
        </div>

        {/* Telif */}
        <p className="text-[11px] text-neutral-500">
          © {new Date().getFullYear()} DexX Shop. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}

export default Footer;