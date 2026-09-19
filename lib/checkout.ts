import crypto from 'crypto';
import { getCurrentUser } from './auth';
import { sendLicenseEmail } from './mail';
import { supabaseAdmin } from './supabase';
import { getUserBalance, updateUserBalance } from './wallet';

export interface PurchasedKey {
  productTitle: string;
  tier: string;
  orderCode: string;
}

export interface CheckoutResult {
  success: boolean;
  error?: string;
  keys?: PurchasedKey[];
  remainingBalance?: number;
  deliveryEmail?: string;
  orderCode?: string;
}

// 6 haneli benzersiz sipariş kodu üretici (Örn: DEXX-7B92A4)
export function generateOrderCode(): string {
  const code = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `DEXX-${code}`;
}

export async function processCartCheckout(
  email: string,
  items: { id: string; title: string; price: number; quantity: number; tier?: string }[]
): Promise<CheckoutResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Satın alım yapabilmek için giriş yapmalısınız.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Geçerli bir teslimat e-posta adresi giriniz.' };
  }

  if (!items || items.length === 0) {
    return { success: false, error: 'Sepetinizde ürün bulunmuyor.' };
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currentBalance = await getUserBalance(user.id);

  if (currentBalance < totalAmount) {
    return {
      success: false,
      error: `Yetersiz bakiye! Gerekli: $${totalAmount.toFixed(2)}, Mevcut: $${currentBalance.toFixed(2)}. Lütfen profilinizden bakiye yükleyin.`
    };
  }

  // 1. Bakiyeyi düş
  const newBalance = await updateUserBalance(user.id, -totalAmount);

  // 2. Sipariş Kodu Üret
  const masterOrderCode = generateOrderCode();
  const purchasedItems: PurchasedKey[] = [];

  for (const item of items) {
    const tierName = item.tier || 'Standart Lisans';
    purchasedItems.push({
      productTitle: item.title,
      tier: tierName,
      orderCode: masterOrderCode
    });

    // Müşteriye Discord Ticket yönlendirmeli maili gönder
    try {
      await sendLicenseEmail(cleanEmail, item.title, tierName, masterOrderCode);
    } catch (mailErr) {
      console.error(`Mail gönderilemedi (${cleanEmail}):`, mailErr);
    }
  }

  // 3. Siparişi Doğrudan Supabase'e Kaydet (Vercel için kalıcı çözüm)
  try {
    const { error: orderError } = await supabaseAdmin.from('orders').insert({
      id: masterOrderCode,
      user_id: String(user.id),
      username: user.username || 'Kullanıcı',
      delivery_email: cleanEmail,
      items: items,
      total_amount: totalAmount,
      status: 'pending',
      created_at: new Date().toISOString()
    });

    if (orderError) {
      console.error('Supabase sipariş kayıt hatası:', orderError.message);
    }
  } catch (dbErr) {
    console.error('Supabase sipariş insert beklenmeyen hata:', dbErr);
  }

  return {
    success: true,
    keys: purchasedItems,
    remainingBalance: newBalance,
    deliveryEmail: cleanEmail,
    orderCode: masterOrderCode
  };
}