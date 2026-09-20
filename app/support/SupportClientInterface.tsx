'use client';

import { supabase } from 'lib/supabase';
import {
  closeTicketAction,
  createTicketAction,
  getTicketMessagesAction,
  getUserTicketsAction,
  sendMessageAction,
  Ticket,
  TicketMessage,
} from 'lib/tickets';
import { useEffect, useRef, useState } from 'react';

export default function SupportClientInterface({
  user,
  initialTickets,
}: {
  user: any;
  initialTickets: Ticket[];
}) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const refreshTickets = async () => {
    const t = await getUserTicketsAction();
    setTickets(t || []);
  };

  // Aktif bilet değişince mesajları ve realtime dinleyiciyi kur
  useEffect(() => {
  if (!activeTicket) return;

  // 1. Önce eski mesajları yükle
  getTicketMessagesAction(activeTicket.id).then((res) => {
    setMessages(res || []);
  });

  // 2. Realtime Aboneliği
  const channel = supabase
    .channel(`room_${activeTicket.id}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'ticket_messages',
      },
      (payload) => {
        const newMsg = payload.new as TicketMessage;
        if (newMsg && newMsg.ticket_id === activeTicket.id) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      }
    )
    .subscribe((status, err) => {
      console.log('[Destek Realtime Durumu]:', status);
      if (err) console.error('[Realtime Hatası]:', err);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}, [activeTicket?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCreateTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await createTicketAction(formData);

    if (!res.success) {
      setErrorMsg(res.error || 'Talep oluşturulamadı.');
      setIsSubmitting(false);
      return;
    }

    const newTicket: Ticket = {
      id: res.ticketId!,
      user_id: user.id,
      username: user.username || user.email || 'Kullanıcı',
      subject: formData.get('subject') as string,
      order_id: (formData.get('order_id') as string) || undefined,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTickets((prev) => [newTicket, ...prev]);
    setActiveTicket(newTicket);
    setIsSubmitting(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeTicket || activeTicket.status === 'closed') return;

    const msg = inputText;
    setInputText('');
    await sendMessageAction(activeTicket.id, msg);
  };

  const handleCloseTicket = async () => {
    if (!activeTicket) return;
    if (confirm('Bu destek talebini kapatmak istediğinize emin misiniz?')) {
      await closeTicketAction(activeTicket.id);
      setActiveTicket(null);
      await refreshTickets();
    }
  };

  // 1. Canlı Sohbet Odası Aktifse
  if (activeTicket) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col h-[620px] bg-[#0c0c10] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:px-6 bg-neutral-950/90 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTicket(null);
                refreshTickets();
              }}
              className="text-xs bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 px-3 py-1.5 rounded-xl transition"
            >
              ← Biletlerim
            </button>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>{activeTicket.subject}</span>
                {activeTicket.order_id && (
                  <span className="text-[10px] bg-red-950/80 border border-red-800 text-red-400 px-2 py-0.5 rounded font-mono">
                    {activeTicket.order_id}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {activeTicket.claimed_by_name ? `İlgilenen Yetkili: @${activeTicket.claimed_by_name}` : 'Yetkili bekleniyor...'}
              </p>
            </div>
          </div>

          {activeTicket.status !== 'closed' && (
            <button
              onClick={handleCloseTicket}
              className="text-xs bg-neutral-900 hover:bg-red-950/60 hover:text-red-400 border border-neutral-800 hover:border-red-800 px-3 py-1.5 rounded-xl transition font-semibold"
            >
              Talebi Kapat
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          {messages.map((msg) => {
            const isMe = msg.sender_id === user.id;
            const isStaff = msg.sender_role === 'admin' || msg.sender_role === 'owner' || msg.sender_role === 'moderator';
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
                  <span className="text-[10px] font-bold text-neutral-400">
                    {msg.sender_name}
                  </span>
                  {isStaff && (
                    <span className="text-[9px] bg-red-950 border border-red-800 text-red-400 font-black px-1.5 py-0.2 rounded">
                      YETKİLİ
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

        {activeTicket.status === 'closed' ? (
          <div className="p-4 bg-neutral-950 border-t border-neutral-800 text-center text-xs text-neutral-500">
            Bu bilet kapatılmıştır.
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-neutral-950 border-t border-neutral-800 flex gap-2">
            <input
              type="text"
              placeholder="Mesajınızı yazın..."
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
    );
  }

  // 2. Destek Formu ve Bilet Listesi
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sol Sütun: Biletlerim ve Discord */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-[#0e0e12] border border-white/[0.06] rounded-3xl p-6 space-y-3 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800/80 flex items-center justify-center text-indigo-400 text-lg">
              💬
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Discord Topluluk Desteği</h4>
              <p className="text-[11px] text-neutral-400">Ortalama Yanıt: ~5-15 Dakika</p>
            </div>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Acil durumlarda veya ekran paylaşımıyla destek almak istediğinizde Discord sunucumuza gelebilirsiniz.
          </p>
          <a
            href="https://discord.gg/P4hymgPn3R"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs font-bold text-indigo-400 hover:text-indigo-300 pt-1"
          >
            Discord Sunucusuna Katıl →
          </a>
        </div>

        <div className="bg-[#0e0e12] border border-white/[0.06] rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Taleplerim ({tickets.length})</span>
            <span className="text-[11px] text-neutral-500 font-normal">Tıkla & Mesajlaş</span>
          </h3>

          {tickets.length === 0 ? (
            <p className="text-xs text-neutral-500 py-4 text-center">Henüz açılmış bir destek talebiniz yok.</p>
          ) : (
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveTicket(t)}
                  className="p-3.5 rounded-2xl bg-black/40 hover:bg-neutral-900 border border-neutral-800/80 hover:border-red-600/50 cursor-pointer transition flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{t.subject}</p>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {new Date(t.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                      t.status === 'open'
                        ? 'bg-amber-950/80 border-amber-800 text-amber-400'
                        : t.status === 'claimed'
                        ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-400'
                    }`}
                  >
                    {t.status === 'open' ? 'Açık' : t.status === 'claimed' ? 'Yetkili Devraldı' : 'Kapatıldı'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sağ Sütun: Yeni Bilet Açma Formu */}
      <div className="lg:col-span-7 bg-[#0c0c10] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">Yeni Destek Talebi Aç</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Sorununuzu ilettiğiniz anda panelimize düşer ve yetkililerimiz canlı yanıt verir.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-400 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Konu Başlığı
            </label>
            <input
              name="subject"
              type="text"
              required
              placeholder="Örn: Rust Mod Kurulum Sorunu / Key Teslimatı"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Sipariş Numarası (Varsa)
            </label>
            <input
              name="order_id"
              type="text"
              placeholder="Örn: DEXX-9281 veya boş bırakın"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 transition font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Mesajınız / Sorunun Detayları
            </label>
            <textarea
              name="message"
              rows={4}
              required
              placeholder="Yaşadığınız durumu veya sormak istediğinizi detaylıca açıklayınız..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-red-600 transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-red-950 cursor-pointer"
          >
            {isSubmitting ? 'Talep Oluşturuluyor...' : 'Destek Talebini Başlat →'}
          </button>
        </form>
      </div>
    </div>
  );
}