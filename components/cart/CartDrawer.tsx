'use client';

import { processCartCheckoutAction } from 'app/actions/checkout';
import { useCart } from 'lib/cart';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartDrawer() {
  const { isOpen, closeCart, items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [deliveryEmail, setDeliveryEmail] = useState('');
  const [remainingBalance, setRemainingBalance] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Seçilen paketi (Günlük/Haftalık/Aylık) tam olarak iletiyoruz
      const res = await processCartCheckoutAction(
        email,
        items.map((it) => ({
          id: it.id,
          title: it.title,
          price: it.price,
          quantity: it.quantity,
          tier: it.selectedTier || 'Aylık'
        }))
      );

      if (res.success) {
        setIsSuccess(true);
        setDeliveryEmail(res.deliveryEmail || email);
        setRemainingBalance(res.remainingBalance);
        clearCart();
      } else {
        setError(res.error || 'Ödeme tamamlanamadı.');
      }
    } catch {
      setError('İşlem sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  function handleFinishAndClose() {
    setIsSuccess(false);
    closeCart();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={handleFinishAndClose} />

      <div className="relative w-full max-w-md bg-[#0e0e11] border-l border-neutral-800 h-full p-6 flex flex-col justify-between overflow-y-auto text-white shadow-2xl">
        <div>
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛒</span>
              <h2 className="text-lg font-black tracking-tight">Sepetiniz</h2>
              {!isSuccess && (
                <span className="text-xs bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full font-bold">
                  {items.length} Kalem
                </span>
              )}
            </div>
            <button
              onClick={handleFinishAndClose}
              className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 hover:text-red-400 flex items-center justify-center text-sm transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Başarılı Sipariş Ekranı */}
          {isSuccess ? (
            <div className="space-y-6 py-6 animate-fadeIn text-center">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-3xl">
                ✉️
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-white tracking-tight">Tebrikler, Sipariş Tamamlandı!</h3>
                <p className="text-xs text-neutral-300 leading-relaxed max-w-xs mx-auto">
                  Lisans anahtarınız başarıyla üretildi ve <strong className="text-emerald-400 font-mono">{deliveryEmail}</strong> adresinize iletildi.
                </p>
                <p className="text-[11px] text-neutral-500">
                  Lütfen gelen kutunuzu (ve spam/gereksiz klasörünü) kontrol ediniz.
                </p>
              </div>

              {remainingBalance !== undefined && (
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-400 inline-block">
                  Kalan Bakiyeniz: <span className="text-white font-bold">${remainingBalance.toFixed(2)} USD</span>
                </div>
              )}

              <div className="space-y-2 pt-4">
                <Link
                  href="/profile"
                  onClick={handleFinishAndClose}
                  className="w-full block text-center py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-red-950"
                >
                  Lisansımı Aktif Etmeye Git →
                </Link>
                <button
                  type="button"
                  onClick={handleFinishAndClose}
                  className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-xs font-semibold transition cursor-pointer"
                >
                  Alışverişe Devam Et
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-neutral-500 space-y-3">
              <span className="text-4xl block">🛍️</span>
              <p className="text-sm">Sepetiniz şu an boş.</p>
            </div>
          ) : (
            /* Sepet Ürünleri */
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.selectedTier}`}
                  className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white truncate">{item.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950/80 border border-red-800/80 text-red-400">
                        {item.selectedTier}
                      </span>
                    </div>
                    <span className="text-xs text-red-500 font-mono font-bold block mt-1">
                      ${(item.price * item.quantity).toFixed(2)} USD
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedTier, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-xs text-neutral-400 hover:text-white"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono px-1.5">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedTier, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-xs text-neutral-400 hover:text-white"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id, item.selectedTier)}
                      className="w-6 h-6 flex items-center justify-center text-xs text-neutral-500 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isSuccess && items.length > 0 && (
          <div className="pt-4 border-t border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Genel Toplam:</span>
              <span className="text-2xl font-black text-white font-mono">${totalPrice.toFixed(2)} USD</span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-semibold leading-relaxed">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Lisans Teslimat E-Postası
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lisans@ornek.com"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-600 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition cursor-pointer shadow-lg shadow-red-950 text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? 'Sipariş İşleniyor...' : 'Cüzdan Bakiyesi ile Satın Al'}</span>
                <span>→</span>
              </button>
            </form>

            <div className="text-center">
              <Link
                href="/profile"
                onClick={closeCart}
                className="text-[11px] text-neutral-400 hover:text-red-400 transition"
              >
                Bakiyen yetersiz mi? <strong className="text-white underline">Profilinden Bakiye Yükle</strong>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}