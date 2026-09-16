import { logoutAction } from 'app/auth/actions';
import CartButton from 'components/cart/CartButton';
import { getCurrentUser } from 'lib/auth';
import Link from 'next/link';

export async function Navbar() {
  const user = await getCurrentUser();
  const hasAdminAccess = user && (user.role === 'owner' || user.role === 'admin' || user.role === 'moderator');

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto w-full max-w-4xl bg-[#111113]/90 border border-neutral-800/90 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl rounded-full p-2 pl-3 pr-3 flex items-center justify-between gap-4 transition-all duration-300 hover:border-neutral-700">
        
        {/* Sol Alan: Boyutu Kesin Sınırlandırılmış Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-10 h-10 max-w-[40px] max-h-[40px] rounded-full flex items-center justify-center overflow-hidden hover:scale-105 transition-transform duration-200 shrink-0"
            title="DexX Shop"
          >
            <img
              src="/logo.png"
              alt="DexX Shop Logo"
              width={40}
              height={40}
              className="w-10 h-10 max-w-[40px] max-h-[40px] object-contain filter drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]"
            />
          </Link>
          <Link href="/" className="font-extrabold text-sm tracking-wider text-white hover:text-red-400 transition hidden sm:inline-block">
            DexX Shop
          </Link>
        </div>

        {/* Menü Linkleri */}
        <div className="flex items-center gap-1 sm:gap-6 text-xs sm:text-sm font-medium text-neutral-300">
          <Link href="/" className="hover:text-white hover:bg-neutral-800/60 px-3 py-1.5 rounded-full transition-colors">
            Anasayfa
          </Link>
          <Link href="/#products" className="hover:text-white hover:bg-neutral-800/60 px-3 py-1.5 rounded-full transition-colors">
            Ürünler
          </Link>
          <Link href="/status" className="hover:text-white hover:bg-neutral-800/60 px-3 py-1.5 rounded-full transition-colors hidden sm:inline-block">
            Durum
          </Link>
          <Link href="/support" className="hover:text-white hover:bg-neutral-800/60 px-3 py-1.5 rounded-full transition-colors hidden sm:inline-block">
            Destek
          </Link>

          {hasAdminAccess && (
            <Link
              href="/admin"
              className="text-red-400 hover:text-red-300 hover:bg-red-950/50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 font-semibold text-xs border border-red-900/40"
            >
              <span>🛡️</span>
              <span>Yönetim</span>
            </Link>
          )}
        </div>

        {/* Sağ: Canlı Sepet & Profil/Giriş */}
        <div className="flex items-center gap-2">
          <CartButton />

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="bg-white hover:bg-neutral-200 text-black text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-2 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <span>@{user.username}</span>
              </Link>

              <form action={logoutAction} className="inline-flex">
                <button
                  type="submit"
                  title="Çıkış Yap"
                  className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 hover:border-red-900 hover:text-red-400 text-neutral-400 flex items-center justify-center text-xs transition cursor-pointer"
                >
                  ✕
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-neutral-300 hover:text-white text-xs sm:text-sm font-medium px-3 py-1.5 transition hidden sm:inline-block"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="bg-white hover:bg-neutral-200 text-black text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 rounded-full transition-all duration-200 shadow-sm"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;