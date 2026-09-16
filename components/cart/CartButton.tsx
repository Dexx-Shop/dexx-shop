'use client';

import { useCart } from 'lib/cart';

export default function CartButton() {
  const { totalItems, openCart } = useCart();

  return (
    <button
      onClick={openCart}
      title="Sepeti Aç"
      className="relative w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white flex items-center justify-center transition cursor-pointer shrink-0"
    >
      <span className="text-sm">🛒</span>
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
          {totalItems}
        </span>
      )}
    </button>
  );
}