'use server';

import crypto from 'crypto';
import { getCurrentUser } from 'lib/auth';
import { sendLicenseEmail } from 'lib/mail';
import { supabaseAdmin } from 'lib/supabase';
import { getUserBalance, updateUserBalance } from 'lib/wallet';

export interface CheckoutResult {
  success: boolean;
  error?: string;
  deliveryEmail?: string;
  remainingBalance?: number;
  orderCode?: string;
}

// 6 Haneli Benzersiz Sipariş Kodu Üretici (Örn: DEXX-8F3A12)
function generateOrderCode(): string {
  const code = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `DEXX-${code}`;
}

export async function processCartCheckoutAction(
  email: string,
  items: { id: string; title: string; price: number; quantity: number; tier?: string }[]
): Promise<CheckoutResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Satın alım yapabilmek için lütfen giriş yapın.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Geçerli bir lisans teslimat e-postası giriniz.' };
  }

  if (!items || items.length === 0) {
    return { success: false, error: 'Sepetinizde ürün bulunmuyor.' };
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currentBalance = await getUserBalance(user.id);

  if (currentBalance < totalAmount) {
    return {
      success: false,
      error: `Yetersiz bakiye! Gerekli: $${totalAmount.toFixed(2)}, Cüzdanınız: $${currentBalance.toFixed(2)}. Lütfen profilinizden bakiye yükleyin.`
    };
  }

  // 1. Bakiyeyi Düş
  const newBalance = await updateUserBalance(user.id, -totalAmount);

  // 2. Benzersiz Sipariş Kodu Oluştur
  const masterOrderCode = generateOrderCode();

  // 3. E-posta Gönderimi (Discord Ticket Yönlendirmeli)
  for (const item of items) {
    const tier = item.tier || 'Aylık';
    try {
      await sendLicenseEmail(cleanEmail, item.title, tier, masterOrderCode);
    } catch (mailErr) {
      console.error('Mail gönderim hatası:', mailErr);
    }
  }

  // 4. Doğrudan Supabase 'orders' Tablosuna Kaydet
  try {
    const { error: orderError } = await supabaseAdmin.from('orders').insert([
      {
        id: masterOrderCode,
        user_id: String(user.id),
        username: user.username || 'Kullanıcı',
        delivery_email: cleanEmail,
        items: items,
        total_amount: totalAmount,
        status: 'pending'
      }
    ]);

    if (orderError) {
      console.error('Supabase orders kayıt hatası:', orderError.message);
    }
  } catch (dbErr) {
    console.error('Supabase insert beklenmeyen hata:', dbErr);
  }

  return {
    success: true,
    deliveryEmail: cleanEmail,
    remainingBalance: newBalance,
    orderCode: masterOrderCode
  };
}