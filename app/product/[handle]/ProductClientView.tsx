'use client';

import { useCart } from 'lib/cart';
import { Product } from 'lib/products';
import Link from 'next/link';
import { useState } from 'react';

export default function ProductClientView({ product }: { product: Product }) {
  const { addItem } = useCart();

  const pricing = product.pricing || {};
  const stock = product.stock || { daily: true, weekly: true, monthly: true, lifetime: true };

  const availableTiers = [
    { key: 'daily', label: '1 Günlük', price: pricing.daily, inStock: stock.daily !== false },
    { key: 'weekly', label: 'Haftalık', price: pricing.weekly, inStock: stock.weekly !== false, badge: 'EN POPÜLER' },
    { key: 'monthly', label: 'Aylık', price: pricing.monthly, inStock: stock.monthly !== false },
    { key: 'lifetime', label: 'Lifetime / Sınırsız', price: pricing.lifetime, inStock: stock.lifetime !== false }
  ].filter((t) => typeof t.price === 'number' && t.price > 0);

  const [selectedTier, setSelectedTier] = useState<string>(
    availableTiers[1]?.key || availableTiers[0]?.key || 'monthly'
  );

  const currentOption = availableTiers.find((t) => t.key === selectedTier);
  const currentPrice = currentOption?.price || 0;
  const isSelectedInStock = currentOption ? currentOption.inStock : true;

  function handleAddToCart() {
    if (!currentOption || !isSelectedInStock) return;
    addItem({
      productId: String(product.id),
      title: product.title,
      game: product.game,
      image: product.image,
      tierKey: currentOption.key,
      tierLabel: currentOption.label,
      price: currentPrice
    });
  }

  function handleBuyNow() {
    if (!currentOption || !isSelectedInStock) return;
    handleAddToCart();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-white pb-24">
      {/* Gezinme Yolu */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-6 font-medium">
        <Link href="/" className="hover:text-red-400 transition">Anasayfa</Link>
        <span>›</span>
        <Link href="/#products" className="hover:text-red-400 transition">Ürünler</Link>
        <span>›</span>
        <span className="text-neutral-500 uppercase">{product.game}</span>
        <span>›</span>
        <span className="text-white truncate">{product.title}</span>
      </nav>

      {/* Başlık ve Durum */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
          {product.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/80 text-emerald-400 font-semibold flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {product.securityTag || 'Güncel & Aktif'}
          </span>
          <span className="px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 font-medium">
            ⚡ Anında Otomatik Teslimat
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Sol Alan: Görsel & Açıklama */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
          </div>

          <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-3xl p-7 backdrop-blur-md">
            <h2 className="text-lg font-bold text-white mb-3">Açıklama & Ürün Detayları</h2>
            <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line font-normal">
              {product.description || 'Bu ürün hakkında henüz detaylı açıklama girilmemiştir.'}
            </p>
          </div>
        </div>

        {/* Sağ Alan: Lisans ve Satın Alma Kartı */}
        <div className="lg:col-span-1 lg:sticky lg:top-28">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-black text-white">{product.title}</h3>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-neutral-400 font-medium uppercase tracking-wider">Lisans Seçenekleri</span>
                <span className="text-neutral-400 text-[11px]">Süre Seçiniz</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {availableTiers.map((tier) => {
                const isSelected = selectedTier === tier.key;

                return (
                  <div
                    key={tier.key}
                    onClick={() => setSelectedTier(tier.key)}
                    className={`relative p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-neutral-950 border-red-600 shadow-lg shadow-red-950/40'
                        : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-red-600' : 'border-neutral-600'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-red-600"></div>}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{tier.label}</span>
                          {tier.badge && (
                            <span className="text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                              {tier.badge}
                            </span>
                          )}
                        </div>

                        <div className="mt-0.5">
                          {tier.inStock ? (
                            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Stokta Var
                            </span>
                          ) : (
                            <span className="text-[11px] text-red-400 font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Tükendi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-base font-black text-white">
                        ${tier.price?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Satın Alma & Sepete Ekle */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                disabled={!isSelectedInStock}
                onClick={handleBuyNow}
                className={`w-full font-extrabold py-3.5 rounded-xl transition duration-200 text-sm shadow-lg ${
                  isSelectedInStock
                    ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-red-950'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                }`}
              >
                {isSelectedInStock
                  ? `Hemen Satın Al ($${currentPrice.toFixed(2)})`
                  : 'Bu Lisans Tükendi'}
              </button>

              <button
                type="button"
                disabled={!isSelectedInStock}
                onClick={handleAddToCart}
                className="w-full bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-white font-semibold py-3 rounded-xl transition duration-200 cursor-pointer text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🛒 Sepete Ekle
              </button>
            </div>

            <p className="text-center text-[11px] text-neutral-500 flex items-center justify-center gap-1.5">
              🛡️ Güvenli Ödeme & Anında Otomatik Teslimat
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}