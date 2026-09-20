'use client';

import { supabase } from 'lib/supabase';
import {
  closeTicketAction,
  createTicketAction,
  getTicketMessagesAction,
  getUserTicketsAction,
  sendMessageAction,
  Ticket,
  TicketMessage
} from 'lib/tickets';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

// ==========================================
// 1. CANLI SOHBET ODASI BİLEŞENİ (Dahili)
// ==========================================
function LiveChatRoom({
  ticket,
  currentUserId,
  onCloseRoom
}: {
  ticket: Ticket;
  currentUserId: string;
  onCloseRoom: () => void;
}) {
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mesajları çek
    getTicketMessagesAction(ticket.id).then((res) => setMessages(res || []));

    // Supabase Realtime Dinleyici
    const channel = supabase
      .channel(`ticket_room_${ticket.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticket.id}`
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
  }, [ticket.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading || ticket.status === 'closed') return;

    setLoading(true);
    const msg = inputText;
    setInputText('');

    await sendMessageAction(ticket.id, msg);
    setLoading(false);
  };

  const handleClose = async () => {
    if (confirm('Bu destek talebini sonlandırmak istediğinize emin misiniz?')) {
      await closeTicketAction(ticket.id);
      onCloseRoom();
    }
  };

  return (
    <div className="flex flex-col h-[620px] bg-[#0c0c10] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
      {/* Üst Başlık Barı */}
      <div className="p-4 sm:px-6 bg-neutral-950/90 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onCloseRoom}
            className="text-xs bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 px-3 py-1.5 rounded-xl transition"
          >
            ← Biletlerim
          </button>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>{ticket.subject}</span>
              {ticket.order_id && (
                <span className="text-[10px] bg-red-950/80 border border-red-800 text-red-400 px-2 py-0.5 rounded font-mono">
                  {ticket.order_id}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-neutral-400">
              {ticket.claimed_by_name ? `İlgilenen Destek: @${ticket.claimed_by_name}` : 'Yetkili bekleniyor...'}
            </p>
          </div>
        </div>

        {ticket.status !== 'closed' && (
          <button
            onClick={handleClose}
            className="text-xs bg-neutral-900 hover:bg-red-950/60 hover:text-red-400 border border-neutral-800 hover:border-red-800 px-3 py-1.5 rounded-xl transition font-semibold"
          >
            Talebi Kapat
          </button>
        )}
      </div>

      {/* Mesaj Akış Alanı */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-neutral-500 text-xs">
            Henüz mesaj yok. İlk mesajınızı gönderebilirsiniz.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
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
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Mesaj Formu */}
      {ticket.status === 'closed' ? (
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 text-center text-xs text-neutral-500">
          Bu destek talebi kapatılmıştır. Yeni bir konu için destek sayfasından yeni talep açabilirsiniz.
        </div>
      ) : (
        <form onSubmit={handleSend} className="p-3 sm:p-4 bg-neutral-950 border-t border-neutral-800 flex gap-2">
          <input
            type="text"
            placeholder="Mesajınızı yazın..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-600 transition"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Gönder
          </button>
        </form>
      )}
    </div>
  );
}

// ==========================================
// 2. ANA DESTEK SAYFASI (Client Page)
// ==========================================
export default function SupportPage() {
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const refreshTickets = async () => {
    try {
      const t = await getUserTicketsAction();
      setTickets(t || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch('/api/user/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user || userData);
        }
      } catch (e) {
        // Oturum yoksa
      }

      await refreshTickets();
      setLoading(false);
    }
    loadData();
  }, []);

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
      user_id: user?.id || '',
      username: user?.username || user?.email || 'Kullanıcı',
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

  // Aktif Sohbet Seçilmişse Sohbet Ekranı
  if (activeTicket) {
    return (
      <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white pb-24 px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36">
        <div className="max-w-4xl mx-auto">
          <LiveChatRoom
            ticket={activeTicket}
            currentUserId={user?.id || ''}
            onCloseRoom={() => {
              setActiveTicket(null);
              refreshTickets();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white pb-24 px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Başlık Alanı */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/50 border border-red-500/30 text-red-400 text-xs font-bold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CANLI YARDIM MASASI</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Size Nasıl Yardımcı Olabiliriz?
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            E-posta beklemeye son. Lisans teslimatı, teknik sorular ve kurulum için anında canlı destek talebi oluşturun.
          </p>
        </div>

        {/* Yükleniyor */}
        {loading ? (
          <div className="text-center py-20">
            <span className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin inline-block mb-3" />
            <p className="text-xs text-neutral-500">Destek sistemi yükleniyor...</p>
          </div>
        ) : !user ? (
          /* Giriş Yapmamış Kullanıcı */
          <div className="text-center py-16 bg-[#0c0c10] border border-neutral-800 rounded-3xl p-8 backdrop-blur-md max-w-xl mx-auto space-y-4 shadow-2xl">
            <span className="text-4xl block">🔒</span>
            <h3 className="text-lg font-bold text-white">Giriş Yapmanız Gerekiyor</h3>
            <p className="text-xs text-neutral-400">
              Canlı destek talebi açmak ve yetkililerimizle birebir mesajlaşabilmek için lütfen hesabınıza giriş yapın.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-block px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-red-950 cursor-pointer"
              >
                Giriş Yap →
              </Link>
            </div>
          </div>
        ) : (
          /* Biletler ve Yeni Bilet Formu */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* SOL TARAFI: BİLGİ KARTLARI & GEÇMİŞ TALEPLER */}
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
                  Acil durumlarda veya sesli/ekran paylaşımlı teknik destek için Discord sunucumuza da katılabilirsiniz.
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

              {/* Biletlerim */}
              <div className="bg-[#0e0e12] border border-white/[0.06] rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center justify-between">
                  <span>Taleplerim ({tickets.length})</span>
                  <span className="text-[11px] text-neutral-500 font-normal">Tıkla & Mesajlaş</span>
                </h3>

                {tickets.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-4 text-center">Henüz açılmış bir destek talebiniz bulunmuyor.</p>
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

            {/* SAĞ TARAFI: YENİ TICKET AÇMA FORMU */}
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
        )}

      </div>
    </div>
  );
}