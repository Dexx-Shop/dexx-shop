import CartButton from 'components/cart/CartButton';
import LanguageToggle from 'components/LanguageToggle';
import { getCurrentUser } from 'lib/auth';
import { getUserBalance } from 'lib/wallet';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

export async function Navbar() {
  const user = await getCurrentUser().catch(() => null);
  const isOwnerOrAdmin = user?.role === 'owner' || user?.role === 'admin';

  let balance = 0;
  if (user) {
    try {
      balance = await getUserBalance(user.id);
    } catch {
      balance = 0;
    }
  }

  return (
    <header className="absolute top-0 inset-x-0 z-40 w-full select-none bg-transparent">
      {/* Geniş ve ferah kapsayıcı */}
      <nav className="w-full max-w-[1600px] mx-auto h-28 px-6 sm:px-12 lg:px-16 flex items-center justify-between">
        
        {/* SOL: LOGO & MARKA */}
        <Link href="/" className="flex items-center gap-3.5 group shrink-0">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="DexX Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(239,68,68,0.6)] group-hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>
          <span className="text-2xl font-black tracking-tight flex items-center">
            <span className="text-red-500 drop-shadow-[0_0_18px_rgba(239,68,68,0.7)] group-hover:text-red-400 transition-colors">
              DexX
            </span>
            <span className="text-white ml-2 font-extrabold tracking-normal group-hover:text-neutral-200">
              Shop
            </span>
          </span>
        </Link>

        {/* ORTA: MENÜ LİNKLERİ (FERAH ARALIKLAR) */}
        <div className="hidden lg:flex items-center gap-12 text-[15px] font-semibold tracking-wide">
          <Link 
            href="/" 
            className="text-white hover:text-red-500 transition-colors duration-200"
          >
            Anasayfa
          </Link>
          <Link 
            href="/#products" 
            className="text-neutral-400 hover:text-white transition-colors duration-200"
          >
            Ürünler
          </Link>
          <Link 
            href="/status" 
            className="text-neutral-400 hover:text-white transition-colors duration-200"
          >
            Durum
          </Link>
          <Link 
            href="/support" 
            className="text-neutral-400 hover:text-white transition-colors duration-200"
          >
            Destek
          </Link>
        </div>

        {/* SAĞ: LUSIVE BİREBİR BUTONLAR */}
        <div className="flex items-center gap-5 shrink-0">
          
          {/* Yönetici Butonu */}
          {isOwnerOrAdmin && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/40 border border-red-800/60 text-red-400 hover:text-red-300 text-xs font-bold tracking-tight hover:bg-red-900/50 transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              <span>🛡️</span>
              <span>Yönetim</span>
            </Link>
          )}

          {/* Bakiye Rozeti (Kırmızı DexX Temalı) */}
          {user && (
            <Link
              href="/profile"
              className="flex items-center gap-2.5 h-10 px-2 rounded-2xl bg-black border border-white/[0.08] hover:border-[#ce1818]/60 transition-all select-none group shadow-[0_0_10px_rgba(0,0,0,0.5)] hover:shadow-[0_0_15px_rgba(206,24,24,0.2)]"
            >
              {/* Sol: Cüzdan İkonu Kutusu */}
              <div className="w-7 h-7 rounded-[10px] bg-black flex items-center justify-center border border-[#ce1818]/30 group-hover:border-[#ce1818] transition-colors shrink-0">
                <svg
                  className="w-4 h-4 text-[#ce1818]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                  <rect x="7" y="7" width="14" height="10" rx="2" />
                  <circle cx="16" cy="12" r="1" fill="currentColor" />
                </svg>
              </div>

              {/* Orta: Beyaz Kalın Bakiye Değeri */}
              <span className="text-sm font-extrabold text-white tracking-tight px-0.5">
                ${Number(balance).toFixed(2)}
              </span>

              {/* Sağ: Kırmızı Artı (+) Buton Kutusu */}
              <div className="w-5 h-5 rounded-[8px] bg-[#ce1818] flex items-center justify-center border border-[#ce1818]/40 group-hover:bg-red-600 transition-colors shrink-0">
                <span className="text-xs font-black text-white leading-none mb-0.5">
                  +
                </span>
              </div>
            </Link>
          )}

          {/* LUSIVE BİREBİR: CART BUTONU */}
          <div className="relative flex items-center">
            <Suspense fallback={<div className="w-28 h-10 rounded-full border border-red-500/30 animate-pulse" />}>
              <CartButton />
            </Suspense>
          </div>

          {/* LUSIVE BİREBİR: DASHBOARD / PANEL BUTONU (TAM OVAL CANLI BUTON) */}
          {user ? (
            <Link
              href="/profile"
              className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-sm font-bold tracking-tight shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:shadow-[0_0_35px_rgba(239,68,68,0.8)] transition-all transform hover:scale-[1.03] active:scale-[0.98]"
            >
              {/* Lusive Giriş/Kapı Logosu */}
              <svg className="w-4 h-4 stroke-[2.4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H9" />
              </svg>
              <span>Panel</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-sm font-bold tracking-tight shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:shadow-[0_0_35px_rgba(239,68,68,0.8)] transition-all transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <svg className="w-4 h-4 stroke-[2.4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H9" />
              </svg>
              <span>Giriş Yap</span>
            </Link>
          )}

          {/* Dil Değiştirici */}
          <div className="pl-1">
            <LanguageToggle />
          </div>

        </div>

      </nav>
    </header>
  );
}

export default Navbar;