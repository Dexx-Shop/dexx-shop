'use client';

import { useCart } from 'lib/cart';
import { Product } from 'lib/products';
import Link from 'next/link';
import { useState } from 'react';

export default function ProductClientView({ product }: { product: Product }) {
  const { addItem } = useCart();

  // Varsayılan olarak mevcut en düşük fiyata sahip paketi veya Günlük'ü seç
  const [selectedTier, setSelectedTier] = useState<'Günlük' | 'Haftalık' | 'Aylık'>('Günlük');
  const [isAdded, setIsAdded] = useState(false);

  // Seçili pakete göre fiyatı al
  const currentPrice =
    selectedTier === 'Günlük'
      ? product.pricing.daily || 0
      : selectedTier === 'Haftalık'
      ? product.pricing.weekly || 0
      : product.pricing.monthly || 0;

  function handleAddToCart() {
    if (currentPrice <= 0) return;

    addItem({
      id: product.id,
      title: product.title,
      price: currentPrice,
      selectedTier: selectedTier,
      game: product.game,
      image: product.image
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-red-600 selection:text-white pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto pt-6 sm:pt-10">
        {/* Üst Gezinme */}
        <div className="mb-6 flex items-center gap-2 text-xs text-neutral-400">
          <Link href="/" className="hover:text-white transition">
            Anasayfa
          </Link>
          <span>/</span>
          <span className="text-neutral-500 uppercase">{product.game}</span>
          <span>/</span>
          <span className="text-white truncate">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Sol Kolon: Ürün Görseli & Güvenlik Rozetleri */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-neutral-950 border border-neutral-800/80 shadow-2xl">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />

              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-lg bg-neutral-950/80 border border-neutral-800 text-white backdrop-blur-md">
                  {product.game}
                </span>
                <span className="text-[11px] font-bold px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 backdrop-blur-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {product.securityTag || 'Undetected'}
                </span>
              </div>
            </div>

            {/* Bilgilendirme Kartları */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-center">
                <span className="text-base block mb-1">⚡</span>
                <span className="text-xs font-bold text-white block">Anında Teslim</span>
                <span className="text-[10px] text-neutral-400">E-Posta Kutusuna</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-center">
                <span className="text-base block mb-1">🛡️</span>
                <span className="text-xs font-bold text-white block">Kernel Koruması</span>
                <span className="text-[10px] text-neutral-400">Sürekli Güncel</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-center">
                <span className="text-base block mb-1">🎧</span>
                <span className="text-xs font-bold text-white block">7/24 Destek</span>
                <span className="text-[10px] text-neutral-400">Discord Ekibi</span>
              </div>
            </div>

            {/* Açıklama */}
            <div className="p-6 rounded-3xl bg-neutral-900/30 border border-neutral-800/80 space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Mod Detayları & Özellikler</h3>
              <p className="text-xs text-neutral-400 leading-relaxed whitespace-pre-line">
                {product.description || 'Özel optimize edilmiş çekirdek mimari, düşük gecikme ve tam güvenlik.'}
              </p>
            </div>
          </div>

          {/* Sağ Kolon: Paket Seçimi & Satın Alma Kartı */}
          <div className="lg:col-span-5 bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6 shadow-2xl sticky top-28">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-950/60 border border-red-800/80 text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2">
                Orijinal Lisans
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{product.title}</h1>
              <p className="text-xs text-neutral-400 mt-1">
                Kullanım sürenizi belirleyin ve doğrudan cüzdan bakiyenizle satın alın.
              </p>
            </div>

            {/* Paket Seçenekleri (Günlük, Haftalık, Aylık) */}
            <div className="space-y-2.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Abonelik Paketini Seçin
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {(['Günlük', 'Haftalık', 'Aylık'] as const).map((tier) => {
                  const price =
                    tier === 'Günlük'
                      ? product.pricing.daily
                      : tier === 'Haftalık'
                      ? product.pricing.weekly
                      : product.pricing.monthly;

                  const isSelected = selectedTier === tier;

                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setSelectedTier(tier)}
                      className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-between min-h-[76px] ${
                        isSelected
                          ? 'bg-red-600/15 border-red-600 text-white shadow-lg shadow-red-950/40'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold">{tier}</span>
                      <span className="text-sm font-black font-mono mt-1 text-white">
                        {price && price > 0 ? `$${price.toFixed(2)}` : 'Yok'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fiyat Göstergesi & Sepete Ekle Butonu */}
            <div className="pt-4 border-t border-neutral-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block">
                    Ödenecek Tutar ({selectedTier})
                  </span>
                  <span className="text-3xl font-black text-white font-mono tracking-tight">
                    ${currentPrice.toFixed(2)} <span className="text-xs text-neutral-400 font-sans font-medium">USD</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={currentPrice <= 0}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition cursor-pointer shadow-xl shadow-red-950 text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isAdded ? '✓ Sepete Eklendi!' : `Sepete Ekle (${selectedTier})`}</span>
                <span>→</span>
              </button>

              <p className="text-[11px] text-center text-neutral-500">
                Satın alım sonrası lisans anahtarı girdiğiniz e-posta adresine anında postalanacaktır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}