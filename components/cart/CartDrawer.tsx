'use client';

import { useCart } from 'lib/cart';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    totalPrice
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Karartma Katmanı */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#111113] border-l border-neutral-800 text-white shadow-2xl flex flex-col justify-between">
          
          {/* Üst Başlık */}
          <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛒</span>
              <h2 className="text-lg font-black tracking-tight">Sepetiniz</h2>
              <span className="text-xs bg-red-950/80 text-red-400 border border-red-800/80 px-2 py-0.5 rounded-full font-bold">
                {items.length} Kalem
              </span>
            </div>
            <button
              onClick={closeCart}
              className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 hover:border-red-900 hover:text-red-400 text-neutral-400 flex items-center justify-center text-xs transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Sepet İçeriği */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-20 text-neutral-500 space-y-3">
                <span className="text-4xl block">🛍️</span>
                <p className="text-sm font-medium">Sepetiniz şu anda boş.</p>
                <button
                  onClick={closeCart}
                  className="text-xs text-red-500 hover:text-red-400 font-semibold underline underline-offset-4 cursor-pointer"
                >
                  Modları Keşfetmeye Başla
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-4 flex flex-col gap-3 group hover:border-neutral-700 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded-xl bg-neutral-900 border border-neutral-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-black tracking-wider text-neutral-400 px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                          {item.game}
                        </span>
                        <h4 className="font-bold text-sm text-white truncate mt-0.5">{item.title}</h4>
                        <span className="text-[11px] text-neutral-400 font-medium">
                          {item.tierLabel}
                        </span>
                      </div>
                    </div>

                    {/* Çöp Kutusu */}
                    <button
                      onClick={() => removeItem(item.id)}
                      title="Sepetten Tamamen Çıkar"
                      className="text-neutral-500 hover:text-red-400 p-1.5 text-xs transition cursor-pointer"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Alt Kısım: + / - Kontrolü & Toplam Tutar */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-900">
                    {/* + / - Buton Grubu */}
                    <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1 gap-2">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="w-6 h-6 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center font-bold text-xs transition cursor-pointer border border-neutral-800/80"
                        title="Adet Azalt"
                      >
                        -
                      </button>

                      <span className="font-mono text-xs font-bold text-white px-1">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="w-6 h-6 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center font-bold text-xs transition cursor-pointer border border-neutral-800/80"
                        title="Adet Artır"
                      >
                        +
                      </button>
                    </div>

                    {/* Fiyat Gösterimi */}
                    <div className="text-right font-mono">
                      <span className="text-sm font-black text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-neutral-500 block">
                          (${item.price.toFixed(2)} / adet)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Alt Özet & Ödeme */}
          {items.length > 0 && (
            <div className="p-6 border-t border-neutral-800 bg-neutral-950/50 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Genel Toplam:</span>
                <span className="text-2xl font-black text-white font-mono">
                  ${totalPrice.toFixed(2)} <span className="text-xs text-red-500 font-bold">USD</span>
                </span>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => alert(`Ödeme ekranına yönlendiriliyorsunuz. Toplam Tutar: $${totalPrice.toFixed(2)}`)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition cursor-pointer shadow-lg shadow-red-950 text-sm flex items-center justify-center gap-2"
                >
                  <span>Ödemeye Geç</span>
                  <span>→</span>
                </button>

                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full text-center text-xs text-neutral-500 hover:text-red-400 py-1 transition cursor-pointer"
                >
                  Sepeti Temizle
                </button>
              </div>

              <p className="text-center text-[10px] text-neutral-500">
                🔒 256-Bit SSL Güvencesi & Anında Otomatik Lisans Teslimatı
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}