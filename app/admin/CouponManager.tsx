'use client';

import { Coupon } from 'lib/wallet';
import { useMemo, useState } from 'react';
import { createBulkCouponsAction, createCouponAction } from './actions';

export default function CouponManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [amount, setAmount] = useState<string>('5');
  const [bulkCount, setBulkCount] = useState<string>('50');
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [bulkCopied, setBulkCopied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Kategori Filtreleme: 'all' veya belirli bir dolar tutarı ($5, $10 vb.)
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'used'>('active');

  // Mevcut tutarları otomatik bulup kategori hapları yapma
  const distinctAmounts = useMemo(() => {
    const amounts = Array.from(new Set(coupons.map((c) => Number(c.amount)))).sort((a, b) => a - b);
    return amounts;
  }, [coupons]);

  // Filtrelenmiş kuponlar listesi
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const matchCategory = selectedCategory === 'all' || Number(c.amount) === Number(selectedCategory);
      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? !c.isUsed
          : c.isUsed;
      return matchCategory && matchStatus;
    });
  }, [coupons, selectedCategory, statusFilter]);

  // Tekli Kod Oluştur
  async function handleSingleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('amount', amount);

    const res = await createCouponAction(formData);
    if (res.success && res.coupon) {
      setCoupons([res.coupon, ...coupons]);
      setMessage(`✓ ${res.coupon.code} ($${amount}) kodu başarıyla oluşturuldu!`);
    } else {
      setMessage(`⚠️ ${res.error || 'Hata oluştu'}`);
    }
    setLoading(false);
  }

  // Toplu Kod Oluştur (İtemSatış / Sellauth için)
  async function handleBulkCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('count', bulkCount);

    const res = await createBulkCouponsAction(formData);
    if (res.success && res.coupons) {
      setCoupons([...res.coupons, ...coupons]);
      setMessage(`✓ ${res.coupons.length} adet $${amount}'lık kod başarıyla üretildi!`);
      setSelectedCategory(amount); // Otomatik o tutarın filtresine geç
      setStatusFilter('active');
    } else {
      setMessage(`⚠️ ${res.error || 'Toplu kod oluşturulamadı'}`);
    }
    setLoading(false);
  }

  // Tek bir kodu kopyala
  function handleCopy(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  // Filtrelenmiş tüm kodları alt alta kopyala (İtemSatış / Sellauth formatı)
  function handleCopyFilteredList() {
    if (filteredCoupons.length === 0) return;
    
    // Format:
    // kod
    // kod
    // kod
    const textToCopy = filteredCoupons.map((c) => c.code).join('\n');
    navigator.clipboard.writeText(textToCopy);
    
    setBulkCopied(true);
    setTimeout(() => setBulkCopied(false), 2500);
  }

  return (
    <div className="bg-[#0c0c10] border border-white/[0.08] rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-7 animate-in fade-in duration-200">
      
      {/* ÜST BAŞLIK */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>🎟️</span>
            <span>Bakiye Kuponları & Toplu Key Üretici</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            İtemSatış, Sellauth veya Discord teslimatları için tekli veya toplu kupon üretip tek tıkla kopyalayın.
          </p>
        </div>
      </div>

      {/* ÜRETİM FORMLARI (GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/40 border border-white/[0.05] p-5 rounded-2xl">
        
        {/* SOL: Tutar & Adet Seçimi */}
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-red-500 block">
            1. Tutar ve Adet Belirle
          </span>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                Kupon Tutarı ($ USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">$</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-red-600"
                  placeholder="5"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                Toplu Adet (Adet)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                max="200"
                value={bulkCount}
                onChange={(e) => setBulkCount(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-red-600"
                placeholder="50"
              />
            </div>
          </div>

          {/* Hızlı Tutar Seçim Butonları */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] text-neutral-500 font-bold uppercase">Hızlı Tutar:</span>
            {['5', '10', '15', '20', '25', '50', '100'].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`text-[11px] px-2 py-0.5 rounded-lg border font-mono transition ${
                  amount === val
                    ? 'bg-red-600/20 border-red-600 text-red-400 font-bold'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                ${val}
              </button>
            ))}
          </div>
        </div>

        {/* SAĞ: Üretim Butonları */}
        <div className="space-y-3 flex flex-col justify-end">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
            2. Üretim Modu
          </span>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleSingleCreate}
              disabled={loading}
              className="flex-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs uppercase py-3 rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              {loading ? '...' : `+ 1 Adet ($${amount}) Üret`}
            </button>

            <button
              type="button"
              onClick={handleBulkCreate}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase py-3 rounded-xl transition shadow-lg shadow-red-950/60 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Üretiliyor...' : `⚡ ${bulkCount}x Adet Toplu Üret`}
            </button>
          </div>
        </div>

      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs font-semibold text-emerald-400 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-neutral-500 hover:text-white">✕</button>
        </div>
      )}

      {/* TUTAR KATEGORİLERİ & FİLTRELER */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          
          {/* Kategori Hapları */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-neutral-400 mr-1">Kategori:</span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition ${
                selectedCategory === 'all'
                  ? 'bg-red-600 text-white shadow-md shadow-red-950'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              Tümü ({coupons.length})
            </button>

            {distinctAmounts.map((amt) => {
              const countForAmt = coupons.filter((c) => Number(c.amount) === amt).length;
              const isSelected = selectedCategory === String(amt);
              return (
                <button
                  key={amt}
                  onClick={() => setSelectedCategory(String(amt))}
                  className={`text-xs px-3 py-1.5 rounded-xl font-mono font-bold transition ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-md shadow-red-950'
                      : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
                  }`}
                >
                  ${amt} ({countForAmt})
                </button>
              );
            })}
          </div>

          {/* Aktif / Kullanılmış Filtresi */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="flex items-center bg-black/60 border border-neutral-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  statusFilter === 'active' ? 'bg-neutral-800 text-emerald-400 font-bold' : 'text-neutral-400'
                }`}
              >
                Yalnızca Aktifler
              </button>
              <button
                onClick={() => setStatusFilter('used')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  statusFilter === 'used' ? 'bg-neutral-800 text-neutral-200 font-bold' : 'text-neutral-400'
                }`}
              >
                Kullanılanlar
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  statusFilter === 'all' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400'
                }`}
              >
                Hepsi
              </button>
            </div>
          </div>

        </div>

        {/* TOPLU KOPYALA BUTONU (İtemSatış / Sellauth Paneli) */}
        <div className="flex items-center justify-between bg-neutral-950/80 border border-white/[0.06] p-3.5 rounded-2xl">
          <div>
            <span className="text-xs font-bold text-white block">
              Seçili Listede {filteredCoupons.length} Kod Bulundu
            </span>
            <span className="text-[11px] text-neutral-400">
              {selectedCategory === 'all' ? 'Tüm tutarlar' : `$${selectedCategory} tutarındaki`} {statusFilter === 'active' ? 'aktif' : ''} kodlar.
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyFilteredList}
            disabled={filteredCoupons.length === 0}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-lg ${
              bulkCopied
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-950/60 disabled:opacity-40'
            }`}
          >
            <span>{bulkCopied ? '✓ Kopyalandı!' : '📋 Listeyi Alt Alta Kopyala'}</span>
          </button>
        </div>

        {/* KOD LİSTESİ */}
        <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredCoupons.length === 0 ? (
            <div className="text-center py-10 bg-black/20 border border-neutral-900 rounded-2xl">
              <p className="text-xs text-neutral-500">Seçilen filtrelere uygun kupon bulunamadı.</p>
            </div>
          ) : (
            filteredCoupons.map((c) => (
              <div
                key={c.code}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs hover:border-neutral-700 transition"
              >
                <div className="flex items-center gap-3 font-mono">
                  <span className="font-bold text-white tracking-wider text-xs sm:text-sm">{c.code}</span>
                  <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                    ${Number(c.amount).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {c.isUsed ? (
                    <span className="text-[10px] uppercase font-bold text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded">
                      Kullanıldı
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded">
                      Aktif
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCopy(c.code)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white transition font-semibold text-xs cursor-pointer"
                  >
                    {copiedCode === c.code ? '✓ Kopyalandı' : 'Kopyala'}
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