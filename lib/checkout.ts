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
  key: string;
}

export interface CheckoutResult {
  success: boolean;
  error?: string;
  keys?: PurchasedKey[];
  remainingBalance?: number;
  deliveryEmail?: string;
}

// Güvenli rastgele lisans anahtarı üretici
export function generateLicenseKey(prefix = 'DEXX'): string {
  const p1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const p2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const p3 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const p4 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${p1}-${p2}-${p3}-${p4}`;
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

  // 2. Her bir ürün için lisans anahtarı üret ve Supabase'e ekle
  const generatedKeys: PurchasedKey[] = [];
  const licenseInserts = [];

  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {
      const createdKey = generateLicenseKey('DEXX');
      const tierName = item.tier || 'Standart Lisans';

      generatedKeys.push({
        productTitle: item.title,
        tier: tierName,
        key: createdKey
      });

      // Lisans süresini belirleme
      let days = 30;
      const lowerTier = tierName.toLowerCase();
      if (lowerTier.includes('gün')) days = 1;
      else if (lowerTier.includes('hafta')) days = 7;
      else if (lowerTier.includes('ay')) days = 30;

      const now = new Date();
      const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      // Supabase'e toplu yazmak için listeye alıyoruz
      licenseInserts.push({
        user_id: String(user.id).trim(),
        product_id: item.title,
        license_key: createdKey,
        duration: tierName,
        status: 'active',
        expires_at: expiresAt.toISOString()
      });

      // E-posta gönderimi
      try {
        await sendLicenseEmail(cleanEmail, item.title, tierName, createdKey);
      } catch (mailErr) {
        console.error(`Mail gönderilemedi (${cleanEmail}):`, mailErr);
      }
    }
  }

  // 3. Lisansları doğrudan Supabase 'licenses' tablosuna kaydet
  if (licenseInserts.length > 0) {
    try {
      const { error: insertError } = await supabaseAdmin
        .from('licenses')
        .insert(licenseInserts);

      if (insertError) {
        console.error('Supabase licenses insert hatası:', insertError.message);
      }
    } catch (dbErr) {
      console.error('Supabase licenses insert beklenmeyen hata:', dbErr);
    }
  }

  // 4. Sipariş yedeğini orders dosyasına kaydet
  try {
    const dir = path.dirname(ORDERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let orders: any[] = [];
    if (fs.existsSync(ORDERS_FILE)) {
      orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
    }

    orders.unshift({
      id: `ORD-${Date.now()}`,
      userId: user.id,
      deliveryEmail: cleanEmail,
      items,
      totalAmount,
      keys: generatedKeys,
      createdAt: new Date().toISOString()
    });

    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error('Order save error:', err);
  }

  return {
    success: true,
    keys: generatedKeys,
    remainingBalance: newBalance,
    deliveryEmail: cleanEmail
  };
}