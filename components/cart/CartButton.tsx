"use client";

import { useCart } from "lib/cart"; // veya projendeki cart context/hook importu

export default function CartButton() {
  // Projendeki sepet hook'u nasılsa onu koruyabilirsin (örneğin cart, openCart, totalQuantity vb.)
  const { cart, openCart } = useCart ? useCart() : { cart: null, openCart: () => {} };
  
  // Toplam ürün adedi hesabı
  const totalQuantity = cart?.lines?.reduce((total: number, line: any) => total + (line.quantity || 0), 0) || 0;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label="Sepeti Aç"
      className="relative flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-red-500/40 hover:border-red-500 bg-transparent text-neutral-200 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.25)] group select-none"
    >
      {/* Sepet İkonu */}
      <svg
        className="w-4 h-4 stroke-[2.2] text-neutral-300 group-hover:text-red-400 transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>

      {/* Sepet Yazısı */}
      <span className="text-sm font-bold tracking-tight">
        Sepet
      </span>

      {/* Sağ Üstteki Kırmızı Sayı Rozeti (Badge) */}
      {totalQuantity > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-black flex items-center justify-center border-2 border-black shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-in zoom-in-50">
          {totalQuantity}
        </span>
      )}
    </button>
  );
}