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
    // z-40 seviyesine çekildi (CartDrawer z-50 olduğu için sepet açılınca navbar altta kalır)
// components/navbar/index.tsx dosyasında en dış header:
<header className="fixed top-7 inset-x-0 z-40 flex justify-center px-4 sm:px-6 pointer-events-none">
      <nav className="pointer-events-auto relative w-full max-w-7xl h-14 rounded-full bg-[#0c0c0e]/90 backdrop-blur-xl border border-white/[0.08] shadow-[0_10px_35px_rgba(0,0,0,0.6)] flex items-center justify-between px-5 sm:px-8 font-sans">
        
        {/* SOL: LOGO & MARKA ADI */}
        <div className="flex items-center gap-3 z-10 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group select-none">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="DexX Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] group-hover:drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] group-hover:scale-105 transition-all duration-300"
                priority
              />
            </div>
            
            <span className="text-[17px] tracking-tight font-extrabold flex items-center transition-all duration-200">
              <span className="text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)] group-hover:text-red-400">
                DexX
              </span>
              <span className="text-white ml-1.5 font-bold tracking-normal drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] group-hover:text-neutral-100">
                Shop
              </span>
            </span>
          </Link>
        </div>

        {/* ORTA: MERKEZE ORTALANAN MENÜ LİNKLERİ */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-[13.5px] font-medium tracking-tight">
          <Link 
            href="/" 
            className="text-white hover:text-white transition font-medium"
          >
            Anasayfa
          </Link>
          <Link 
            href="/#products" 
            className="text-[#9ca3af] hover:text-white transition font-medium"
          >
            Ürünler
          </Link>
          <Link 
            href="/status" 
            className="text-[#9ca3af] hover:text-white transition font-medium"
          >
            Durum
          </Link>
          <Link 
            href="/support" 
            className="text-[#9ca3af] hover:text-white transition font-medium"
          >
            Destek
          </Link>
        </div>

        {/* SAĞ: YÖNETİM, CÜZDAN, SEPET, PROFİL & DİL BUTONU */}
        <div className="flex items-center gap-2.5 z-10 shrink-0">
          
          {/* Yönetici Rozeti */}
          {isOwnerOrAdmin && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/40 border border-red-800/60 text-red-400 hover:text-red-300 text-xs font-medium tracking-tight hover:bg-red-900/40 transition mr-1"
            >
              <span>🛡️</span>
              <span>Yönetim</span>
            </Link>
          )}

          {/* Cüzdan Rozeti */}
          {user && (
            <Link
              href="/profile"
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#1c0d0f] border border-red-900/40 hover:border-red-600/60 transition group cursor-pointer"
            >
              <div className="w-5 h-5 rounded-md bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-400 group-hover:text-red-300 transition">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>

              <span className="text-xs font-bold text-white tracking-tight">
                ${Number(balance).toFixed(2)}
              </span>

              <div className="w-4 h-4 rounded-full bg-red-600/80 group-hover:bg-red-500 text-white flex items-center justify-center text-[11px] font-bold leading-none transition">
                +
              </div>
            </Link>
          )}

          {/* Sepet Butonu */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.04] hover:bg-red-950/40 border border-white/[0.06] hover:border-red-900/50 transition text-neutral-300 hover:text-red-400 cursor-pointer">
            <Suspense fallback={<div className="w-4 h-4" />}>
              <CartButton />
            </Suspense>
          </div>

          {/* Profil Butonu */}
          {user ? (
            <Link
              href="/profile"
              title={`Profil: @${user.username || user.email}`}
              className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-red-950/40 border border-white/[0.06] hover:border-red-900/50 flex items-center justify-center text-neutral-300 hover:text-red-400 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-semibold tracking-tight transition shadow-sm ml-1"
            >
              Giriş Yap
            </Link>
          )}

          {/* DİL DEĞİŞTİRME BUTONU (TR / EN) */}
          {/* DİL DEĞİŞTİRME BUTONU (TR / EN) */}
<LanguageToggle />

        </div>

      </nav>
    </header>
  );
}

export default Navbar;