import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getCurrentUser } from './auth';
import { sendLicenseEmail } from './mail';
import { supabaseAdmin } from './supabase';
import { getUserBalance, updateUserBalance } from './wallet';

const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');

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

// 6 haneli şık sipariş kodu üretici (Örn: DEXX-7B92A4)
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

  // 1. Bakiyeyi güvenle düş
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

    // Müşteriye Discord Ticket yönlendirmeli mail gönder
    try {
      await sendLicenseEmail(cleanEmail, item.title, tierName, masterOrderCode);
    } catch (mailErr) {
      console.error(`Mail gönderilemedi (${cleanEmail}):`, mailErr);
    }
  }

  // 3. Siparişi Admin Logları için data/orders.json dosyasına yaz
  try {
    const dir = path.dirname(ORDERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let orders: any[] = [];
    if (fs.existsSync(ORDERS_FILE)) {
      try {
        orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
      } catch {
        orders = [];
      }
    }

    const newOrderRecord = {
      id: masterOrderCode,
      userId: user.id,
      username: user.username || 'Kullanıcı',
      deliveryEmail: cleanEmail,
      items,
      totalAmount,
      status: 'pending', // 'pending' = Discord ticket bekleniyor, 'completed' = key teslim edildi
      createdAt: new Date().toISOString()
    };

    orders.unshift(newOrderRecord);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error('Order log kayıt hatası:', err);
  }

  // 4. Supabase log tablosuna da ekle (opsiyonel hata yakalama ile)
  try {
    await supabaseAdmin.from('orders').insert({
      id: masterOrderCode,
      user_id: String(user.id),
      email: cleanEmail,
      total_amount: totalAmount,
      items: JSON.stringify(items),
      status: 'pending'
    });
  } catch (dbErr) {
    // Supabase tablosu yoksa bile orders.json sayesinde akış aksamaz
    console.log('Supabase orders fallback:', dbErr);
  }

  return {
    success: true,
    keys: purchasedItems,
    remainingBalance: newBalance,
    deliveryEmail: cleanEmail,
    orderCode: masterOrderCode
  };
}