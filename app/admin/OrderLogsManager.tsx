'use client';

import { useState } from 'react';

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  tier?: string;
}

interface OrderRecord {
  id: string;
  userId: string;
  username?: string;
  deliveryEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'completed';
  createdAt: string;
}

export default function OrderLogsManager({ initialOrders = [] }: { initialOrders: OrderRecord[] }) {
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);
  const [search, setSearch] = useState('');

  const filteredOrders = orders.filter((o) => {
    const s = search.toLowerCase();
    return (
      o.id.toLowerCase().includes(s) ||
      o.deliveryEmail.toLowerCase().includes(s) ||
      (o.username && o.username.toLowerCase().includes(s))
    );
  });

  const toggleStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, status: ord.status === 'completed' ? 'pending' : 'completed' }
          : ord
      )
    );
  };

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📋</span>
            <span>Discord Bekleyen Sipariş Logları</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Müşterilerin bakiye ile aldığı ürünler buraya düşer. Discord ticket açtıklarında kodu buradan sorgulayın.
          </p>
        </div>

        {/* Arama Inputu */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sipariş Kodu veya E-posta ara..."
          className="px-4 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-600 w-full sm:w-64"
        />
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-neutral-500 text-xs">
          Henüz kayıtlı bir sipariş bulunmuyor.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950/80 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Sipariş Kodu</th>
                <th className="py-3 px-4">Kullanıcı</th>
                <th className="py-3 px-4">Ürün & Paket</th>
                <th className="py-3 px-4">Tutar</th>
                <th className="py-3 px-4">Tarih</th>
                <th className="py-3 px-4">Durum</th>
                <th className="py-3 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-neutral-950/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-red-400 select-all">
                    {ord.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{ord.username || 'Kullanıcı'}</div>
                    <div className="text-[11px] text-neutral-500">{ord.deliveryEmail}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {ord.items?.map((it, i) => (
                      <div key={i} className="font-medium text-neutral-200">
                        {it.title} <span className="text-red-400 text-[11px]">({it.tier || 'Standart'})</span>
                      </div>
                    ))}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    ${Number(ord.totalAmount).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-400 text-[11px]">
                    {new Date(ord.createdAt).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ord.status === 'completed'
                          ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400'
                          : 'bg-amber-950/80 border border-amber-800 text-amber-400 animate-pulse'
                      }`}
                    >
                      {ord.status === 'completed' ? 'Teslim Edildi' : 'Ticket Bekleniyor'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => toggleStatus(ord.id)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                        ord.status === 'completed'
                          ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {ord.status === 'completed' ? 'Geri Al' : '✓ Teslim Edildi Yap'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}