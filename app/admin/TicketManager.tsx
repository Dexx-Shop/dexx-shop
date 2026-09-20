'use client';

import { supabase } from 'lib/supabase';
import {
    claimTicketAction,
    closeTicketAction,
    getAllTicketsAction,
    getTicketMessagesAction,
    sendMessageAction,
    Ticket,
    TicketMessage,
} from 'lib/tickets';
import { useEffect, useRef, useState } from 'react';

export default function TicketManager({ currentUserId }: { currentUserId: string }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'claimed' | 'closed'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Tüm biletleri çek
  const fetchTickets = async () => {
    try {
      const data = await getAllTicketsAction();
      setTickets(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // 2. Seçili bilet açılınca mesajları ve Realtime dinleyiciyi bağla
  useEffect(() => {
    if (!selectedTicket) return;

    getTicketMessagesAction(selectedTicket.id).then((msgs) => setMessages(msgs || []));

    const channel = supabase
      .channel(`admin_ticket_${selectedTicket.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${selectedTicket.id}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as TicketMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Bileti Claim Et (Üzerine Al)
  const handleClaim = async (ticketId: string) => {
    const res = await claimTicketAction(ticketId);
    if (res.success) {
      await fetchTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket((prev) => (prev ? { ...prev, status: 'claimed' } : null));
      }
    }
  };

  // Mesaj Gönder
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedTicket || selectedTicket.status === 'closed') return;

    const msg = inputText;
    setInputText('');
    await sendMessageAction(selectedTicket.id, msg);
  };

  // Bileti Kapat
  const handleClose = async () => {
    if (!selectedTicket) return;
    if (confirm('Bu bilet çözüldü olarak kapatılsın mı?')) {
      await closeTicketAction(selectedTicket.id);
      setSelectedTicket(null);
      await fetchTickets();
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  // EĞER BİR BİLET SEÇİLİYSE: CANLI MESAJLAŞMA EKRANI
  if (selectedTicket) {
    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedTicket(null);
              fetchTickets();
            }}
            className="text-xs bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>←</span>
            <span>Bilet Listesine Dön</span>
          </button>

          <div className="flex items-center gap-2">
            {selectedTicket.status === 'open' && (
              <button
                onClick={() => handleClaim(selectedTicket.id)}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl transition cursor-pointer"
              >
                Talebi Devral (Claim)
              </button>
            )}
            {selectedTicket.status !== 'closed' && (
              <button
                onClick={handleClose}
                className="text-xs bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-400 font-bold px-3.5 py-2 rounded-xl transition cursor-pointer"
              >
                Bileti Kapat
              </button>
            )}
          </div>
        </div>

        {/* Canlı Chat Odası */}
        <div className="flex flex-col h-[600px] bg-[#0c0c10] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
          {/* Başlık */}
          <div className="p-4 sm:px-6 bg-neutral-950/90 border-b border-neutral-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>{selectedTicket.subject}</span>
                {selectedTicket.order_id && (
                  <span className="text-[10px] bg-red-950/80 border border-red-800 text-red-400 px-2 py-0.5 rounded font-mono">
                    {selectedTicket.order_id}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Müşteri: <strong className="text-neutral-200">@{selectedTicket.username}</strong> • Durum:{' '}
                <span className="uppercase text-red-400 font-bold">{selectedTicket.status}</span>
              </p>
            </div>
          </div>

          {/* Mesaj Akışı */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 custom-scrollbar">
            {messages.map((msg) => {
              const isMe = msg.sender_id === currentUserId;
              const isSystem = msg.sender_id === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="text-center py-2">
                    <span className="text-[11px] bg-white/[0.04] border border-white/[0.08] text-neutral-400 px-3 py-1 rounded-full">
                      {msg.message}
                    </span>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-neutral-400">{msg.sender_name}</span>
                    {msg.sender_role !== 'user' && (
                      <span className="text-[9px] bg-red-950 border border-red-800 text-red-400 font-black px-1.5 py-0.2 rounded">
                        STAFF
                      </span>
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      isMe
                        ? 'bg-red-600 text-white rounded-br-none shadow-lg shadow-red-950/40'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-bl-none'
                    }`}
                  >
                    {msg.message}
                  </div>
                  <span className="text-[9px] text-neutral-600 mt-1 px-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Mesaj Yazma */}
          {selectedTicket.status === 'closed' ? (
            <div className="p-4 bg-neutral-950 border-t border-neutral-800 text-center text-xs text-neutral-500">
              Bu bilet kapatılmıştır.
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-neutral-950 border-t border-neutral-800 flex gap-2">
              <input
                type="text"
                placeholder="Müşteriye yanıt yazın..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-600 transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Gönder
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // BİLET LİSTESİ GÖRÜNÜMÜ
  return (
    <section className="bg-[#0c0c10] border border-white/[0.08] rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🎫</span>
            <span>Canlı Destek Talepleri ({tickets.length})</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Müşterilerin açtığı biletleri görüntüleyin, üzerinize alın ve canlı yanıt verin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtreleme */}
          <div className="flex items-center bg-black/40 border border-neutral-800 p-1 rounded-xl text-xs font-semibold">
            {(['all', 'open', 'claimed', 'closed'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1 rounded-lg transition capitalize ${
                  filter === key ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {key === 'all' ? 'Tümü' : key === 'open' ? 'Açık' : key === 'claimed' ? 'İşlemde' : 'Kapatıldı'}
              </button>
            ))}
          </div>

          <button
            onClick={fetchTickets}
            className="text-xs bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 px-3 py-1.5 rounded-xl transition text-neutral-300 cursor-pointer"
          >
            Yenile ⟳
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-neutral-500 text-xs">Biletler yükleniyor...</div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-16 border border-white/[0.05] rounded-2xl bg-white/[0.01]">
          <span className="text-3xl block mb-2">🎉</span>
          <p className="text-neutral-400 text-xs font-semibold">Bu filtrede bekleyen bir destek talebi bulunmuyor.</p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-800/60">
          {filteredTickets.map((t) => (
            <div
              key={t.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] px-3 rounded-2xl transition"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">{t.subject}</span>
                  {t.order_id && (
                    <span className="text-[10px] bg-red-950 border border-red-800 text-red-400 px-2 py-0.5 rounded font-mono">
                      {t.order_id}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      t.status === 'open'
                        ? 'bg-amber-950/80 border-amber-800 text-amber-400'
                        : t.status === 'claimed'
                        ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-400'
                    }`}
                  >
                    {t.status === 'open' ? 'Açık Bekliyor' : t.status === 'claimed' ? 'İşlemde' : 'Kapatıldı'}
                  </span>
                </div>

                <div className="text-xs text-neutral-400 flex items-center gap-2 flex-wrap">
                  <span>
                    Müşteri: <strong className="text-neutral-200">@{t.username}</strong>
                  </span>
                  <span>•</span>
                  <span>{new Date(t.created_at).toLocaleDateString()}</span>
                  {t.claimed_by_name && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">Yetkili: @{t.claimed_by_name}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {t.status === 'open' && (
                  <button
                    onClick={() => handleClaim(t.id)}
                    className="text-xs font-bold px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition cursor-pointer shadow-md shadow-emerald-950"
                  >
                    Claim Et
                  </button>
                )}
                <button
                  onClick={() => setSelectedTicket(t)}
                  className="text-xs font-bold px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded-xl transition cursor-pointer"
                >
                  Sohbete Gir 💬
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}