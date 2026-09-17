'use server';

import crypto from 'crypto';
import fs from 'fs';
import { getCurrentUser } from 'lib/auth';
import { sendLicenseEmail } from 'lib/mail';
import { getUserBalance, updateUserBalance } from 'lib/wallet';
import path from 'path';

const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');

export interface CheckoutResult {
  success: boolean;
  error?: string;
  deliveryEmail?: string;
  remainingBalance?: number;
}

function generateLicenseKey(prefix = 'DEXX'): string {
  const p1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const p2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const p3 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const p4 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${p1}-${p2}-${p3}-${p4}`;
}

export async function processCartCheckoutAction(
  email: string,
  items: { id: string; title: string; price: number; quantity: number; tier?: string }[]
): Promise<CheckoutResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Satın alım yapabilmek için lütfen giriş yapın.' };
  }

  const cleanEmail = email.trim();
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

  // 1. Bakiyeyi düş
  const newBalance = await updateUserBalance(user.id, -totalAmount);

  // 2. Lisans anahtarları üret ve e-posta ile gönder
  const generatedKeys: { productTitle: string; tier: string; key: string }[] = [];
  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {
      const key = generateLicenseKey('DEXX');
      const tier = item.tier || 'Aylık';
      generatedKeys.push({
        productTitle: item.title,
        tier,
        key
      });

      // Gerçek e-posta gönderimi
      await sendLicenseEmail(cleanEmail, item.title, tier, key);
    }
  }

  // 3. Sipariş kaydı oluştur
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

  // Ekrana key DÖNÜLMÜYOR, güvenlik için sadece bildirim veriliyor
  return {
    success: true,
    deliveryEmail: cleanEmail,
    remainingBalance: newBalance
  };
}