'use client';

import { useState } from 'react';

interface OrderLog {
  id: string;
  userId: string;
  deliveryEmail: string;
  totalAmount: number;
  createdAt: string;
  items: {
    id: string;
    title: string;
    price: number;
    quantity: number;
    tier?: string;
  }[];
  keys: {
    productTitle: string;
    tier: string;
    key: string;
  }[];
}

export default function OrderLogsManager({ initialOrders }: { initialOrders: OrderLog[] }) {
  const [orders] = useState<OrderLog[]>(initialOrders);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchesEmail = o.deliveryEmail?.toLowerCase().includes(q);
    const matchesId = o.id.toLowerCase().includes(q);
    const matchesKey = o.keys?.some((k) => k.key.toLowerCase().includes(q));
    const matchesTitle = o.items?.some((i) => i.title.toLowerCase().includes(q));
    return matchesEmail || matchesId || matchesKey || matchesTitle;
  });

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl backdrop-blur-md overflow-hidden transition-all">
      {/* Başlık ve Açılır/Kapanır Tetikleyici */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 sm:p-7 flex items-center justify-between text-left hover:bg-neutral-850/40 transition cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📜</span>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Sipariş & Key Teslimat Logları
              </h2>
              <span className="text-xs bg-red-950/80 border border-red-800 text-red-400 font-bold px-2 py-0.5 rounded-full">
                {orders.length} Kayıt
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Kayıtları incelemek ve arama yapmak için {isOpen ? 'kapatın' : 'tıklayın'}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200">
            {isOpen ? 'Gizle ▴' : 'Logları Gör ▾'}
          </span>
        </div>
      </button>

      {/* Açılır Panel İçeriği */}
      {isOpen && (
        <div className="p-6 sm:p-8 pt-0 border-t border-neutral-800/80 space-y-6 animate-fadeIn">
          {/* Arama Kutusu */}
          <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-neutral-400">
              E-posta, Key, Sipariş No veya Ürün Adı ile anında filtreleyin:
            </span>

            <div className="w-full sm:w-80">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Örn: lisans@gmail.com, DEXX-..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-600 transition"
              />
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-xs bg-neutral-950/40 rounded-2xl border border-neutral-850">
              Arama kriterine uygun sipariş veya teslimat logu bulunamadı.
            </div>
          ) : (
            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 rounded-2xl bg-neutral-950/90 border border-neutral-800/90 space-y-4 hover:border-neutral-700 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-850 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-white bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-lg">
                        #{order.id}
                      </span>
                      <div className="text-xs text-neutral-300">
                        Alıcı: <strong className="text-emerald-400 font-mono">{order.deliveryEmail}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="text-neutral-400">
                        {new Date(order.createdAt).toLocaleString('tr-TR')}
                      </span>
                      <span className="text-white font-bold bg-red-950/40 border border-red-900/60 px-2.5 py-0.5 rounded-full">
                        ${order.totalAmount?.toFixed(2)} USD
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Teslim Edilen Lisans Detayları:
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {order.keys?.map((k, index) => (
                        <div
                          key={index}
                          className="p-3 bg-neutral-900/90 border border-neutral-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-white truncate">{k.productTitle}</span>
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                                {k.tier}
                              </span>
                            </div>
                            <code className="text-xs font-mono text-red-400 font-bold tracking-wide select-all block truncate">
                              {k.key}
                            </code>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopy(k.key)}
                            className="shrink-0 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] font-semibold text-white transition cursor-pointer"
                          >
                            {copiedKey === k.key ? '✓' : 'Kopyala'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}