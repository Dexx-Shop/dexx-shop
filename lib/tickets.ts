'use server';

import { getCurrentUser } from 'lib/auth';
import { supabaseAdmin } from 'lib/supabase';
import { revalidatePath } from 'next/cache';

export interface Ticket {
  id: string;
  user_id: string;
  username: string;
  subject: string;
  order_id?: string;
  status: 'open' | 'claimed' | 'closed';
  claimed_by_id?: string;
  claimed_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  created_at: string;
}

// 1. Yeni Ticket Açma
export async function createTicketAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Destek talebi açmak için lütfen önce giriş yapın.' };
  }

  const subject = (formData.get('subject') as string)?.trim();
  const orderId = (formData.get('order_id') as string)?.trim() || null;
  const initialMessage = (formData.get('message') as string)?.trim();

  if (!subject || !initialMessage) {
    return { success: false, error: 'Lütfen konu başlığı ve mesajınızı eksiksiz girin.' };
  }

  try {
    // Ticket oluştur
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .insert({
        user_id: user.id,
        username: user.username || user.email,
        subject,
        order_id: orderId,
        status: 'open'
      })
      .select()
      .single();

    if (ticketError || !ticket) {
      return { success: false, error: ticketError?.message || 'Bilet oluşturulamadı.' };
    }

    // İlk mesajı ekle
    await supabaseAdmin.from('ticket_messages').insert({
      ticket_id: ticket.id,
      sender_id: user.id,
      sender_name: user.username || user.email,
      sender_role: user.role || 'user',
      message: initialMessage
    });

    revalidatePath('/support');
    return { success: true, ticketId: ticket.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 2. Kullanıcının Kendi Biletlerini Getir
export async function getUserTicketsAction() {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data } = await supabaseAdmin
    .from('tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  return (data || []) as Ticket[];
}

// 3. Admin İçin Tüm Biletleri Getir
export async function getAllTicketsAction() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'owner' && user.role !== 'admin' && user.role !== 'moderator')) {
    return [];
  }

  const { data } = await supabaseAdmin
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false });

  return (data || []) as Ticket[];
}

// 4. Bilete Ait Mesajları Getir
export async function getTicketMessagesAction(ticketId: string) {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data } = await supabaseAdmin
    .from('ticket_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  return (data || []) as TicketMessage[];
}

// 5. Mesaj Gönder
export async function sendMessageAction(ticketId: string, message: string) {
  const user = await getCurrentUser();
  if (!user || !message.trim()) return { success: false };

  // Ticket kontrolü
  const { data: ticket } = await supabaseAdmin.from('tickets').select('*').eq('id', ticketId).single();
  if (!ticket || ticket.status === 'closed') {
    return { success: false, error: 'Bu bilet kapatılmış.' };
  }

  const { error } = await supabaseAdmin.from('ticket_messages').insert({
    ticket_id: ticketId,
    sender_id: user.id,
    sender_name: user.username || user.email,
    sender_role: user.role || 'user',
    message: message.trim()
  });

  if (error) return { success: false, error: error.message };

  await supabaseAdmin.from('tickets').update({ updated_at: new Date().toISOString() }).eq('id', ticketId);

  return { success: true };
}

// 6. Admin Bileti Claim'lesin (Üzerine Alsın)
export async function claimTicketAction(ticketId: string) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'owner' && user.role !== 'admin' && user.role !== 'moderator')) {
    return { success: false, error: 'Yetkiniz bulunmuyor.' };
  }

  const { error } = await supabaseAdmin
    .from('tickets')
    .update({
      status: 'claimed',
      claimed_by_id: user.id,
      claimed_by_name: user.username || user.email,
      updated_at: new Date().toISOString()
    })
    .eq('id', ticketId);

  if (error) return { success: false, error: error.message };

  // Otomatik sistem mesajı at
  await supabaseAdmin.from('ticket_messages').insert({
    ticket_id: ticketId,
    sender_id: 'system',
    sender_name: 'DexX Destek Botu',
    sender_role: 'admin',
    message: `🛡️ Yetkili @${user.username || user.email} bu talebi devraldı. Size birazdan yardımcı olacaktır.`
  });

  revalidatePath('/support');
  revalidatePath('/admin');
  return { success: true };
}

// 7. Bileti Kapat
export async function closeTicketAction(ticketId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false };

  const { error } = await supabaseAdmin
    .from('tickets')
    .update({
      status: 'closed',
      updated_at: new Date().toISOString()
    })
    .eq('id', ticketId);

  if (error) return { success: false, error: error.message };

  await supabaseAdmin.from('ticket_messages').insert({
    ticket_id: ticketId,
    sender_id: 'system',
    sender_name: 'DexX Destek Botu',
    sender_role: 'admin',
    message: `🔒 Bu destek talebi kapatıldı.`
  });

  revalidatePath('/support');
  return { success: true };
}