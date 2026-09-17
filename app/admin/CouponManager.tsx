'use client';

import { Coupon } from 'lib/wallet';
import { useState } from 'react';
import { createCouponAction } from './actions';

export default function CouponManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [amount, setAmount] = useState<string>('25');
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('amount', amount);

    const res = await createCouponAction(formData);
    if (res.success && res.coupon) {
      setCoupons([res.coupon, ...coupons]);
      setMessage(`✓ ${res.coupon.code} kodu başarıyla oluşturuldu!`);
    } else {
      setMessage(`⚠️ ${res.error || 'Hata oluştu'}`);
    }
    setLoading(false);
  }

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>🎟️</span>
            <span>Bakiye Kuponu Üret (Dolar)</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            İstediğiniz tutarda tek kullanımlık güvenli kod üretip Discord müşterilerine teslim edebilirsiniz.
          </p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-4 max-w-xl">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
            Bakiye Tutarı ($ USD)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">$</span>
            <input
              type="number"
              step="1"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-red-600 transition"
              placeholder="25"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase px-6 py-3 rounded-xl transition cursor-pointer shadow-lg shadow-red-950 disabled:opacity-50"
        >
          {loading ? 'Üretiliyor...' : '+ Kod Oluştur'}
        </button>
      </form>

      {message && (
        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-semibold text-neutral-200">
          {message}
        </div>
      )}

      {/* Üretilen Kodlar Listesi */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
          Son Üretilen Kuponlar ({coupons.length})
        </h3>

        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {coupons.length === 0 ? (
            <p className="text-xs text-neutral-500">Henüz kupon üretilmedi.</p>
          ) : (
            coupons.map((c) => (
              <div
                key={c.code}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs"
              >
                <div className="flex items-center gap-3 font-mono">
                  <span className="font-bold text-white tracking-wider">{c.code}</span>
                  <span className="text-emerald-400 font-bold">${c.amount.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-3">
                  {c.isUsed ? (
                    <span className="text-[10px] uppercase font-bold text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded">
                      Kullanıldı
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                      Aktif
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCopy(c.code)}
                    className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white transition font-semibold"
                  >
                    {copiedCode === c.code ? '✓' : 'Kopyala'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}