'use client';

import { supabase } from 'lib/supabase'; // Supabase client instance
import { closeTicketAction, getTicketMessagesAction, sendMessageAction, Ticket, TicketMessage } from 'lib/tickets';
import { useEffect, useRef, useState } from 'react';

export default function LiveChatRoom({
  ticket,
  currentUserId,
  isAdmin,
  onCloseRoom
}: {
  ticket: Ticket;
  currentUserId: string;
  isAdmin: boolean;
  onCloseRoom: () => void;
}) {
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // İlk mesajları çek
  useEffect(() => {
    getTicketMessagesAction(ticket.id).then(setMessages);

    // Supabase Realtime bağlantısı (Yeni mesaj gelince anında ekrana düşürür)
    const channel = supabase
      .channel(`ticket_${ticket.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${ticket.id}` },
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

  // Otomatik aşağı kaydırma
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
    if (confirm('Bu destek talebini kapatmak istediğinize emin misiniz?')) {
      await closeTicketAction(ticket.id);
      onCloseRoom();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-[#0c0c10] border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Üst Bilgi Barı */}
      <div className="p-4 sm:px-6 bg-neutral-950/80 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onCloseRoom}
            className="text-xs bg-neutral-900 hover:bg-neutral-800 text-neutral-300 px-3 py-1.5 rounded-lg transition"
          >
            ← Biletler
          </button>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>{ticket.subject}</span>
              {ticket.order_id && (
                <span className="text-[10px] bg-red-950/80 border border-red-800 text-red-400 px-2 py-0.5 rounded-md font-mono">
                  {ticket.order_id}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-neutral-400">
              {ticket.claimed_by_name ? `İlgilenen Yetkili: @${ticket.claimed_by_name}` : 'Yetkili bekleniyor...'}
            </p>
          </div>
        </div>

        {ticket.status !== 'closed' && (
          <button
            onClick={handleClose}
            className="text-xs bg-neutral-900 hover:bg-red-950/50 hover:text-red-400 border border-neutral-800 hover:border-red-800 px-3 py-1.5 rounded-xl transition font-semibold"
          >
            Talebi Kapat
          </button>
        )}
      </div>

      {/* Mesaj Akış Alanı */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 custom-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          const isStaff = msg.sender_role === 'admin' || msg.sender_role === 'owner' || msg.sender_role === 'moderator';
          const isSystem = msg.sender_id === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center py-2">
                <span className="text-[11px] bg-white/[0.05] border border-white/[0.08] text-neutral-400 px-3 py-1 rounded-full">
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
                  <span className="text-[9px] bg-red-950 border border-red-800 text-red-400 font-extrabold px-1.5 py-0.2 rounded">
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

      {/* Mesaj Gönderme Formu */}
      {ticket.status === 'closed' ? (
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 text-center text-xs text-neutral-500">
          Bu destek talebi kapatılmıştır. Yeni bir sorun için yeni talep oluşturabilirsiniz.
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