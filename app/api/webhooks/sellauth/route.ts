import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const LICENSES_FILE = path.join(process.cwd(), 'data', 'licenses.json');

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // SellAuth webhook verisini yakala
    // payload event tipine göre (örn: invoice:completed, order:paid)
    const event = payload.event || payload.action;
    const invoice = payload.data || payload.invoice || payload;

    // Ödeme tamamlandıysa
    if (event === 'invoice:completed' || invoice.status === 'completed' || invoice.status === 'paid') {
      const email = invoice.email || invoice.customer?.email;
      const customFields = invoice.custom_fields || {};
      const isTopup = customFields.isTopup === 'true';
      const amount = Number(invoice.total || invoice.usd_amount || 0);

      if (!fs.existsSync(USERS_FILE)) return NextResponse.json({ received: true });

      const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
      const userIndex = users.findIndex(
        (u: any) => u.email.toLowerCase() === (email || '').toLowerCase()
      );

      if (userIndex !== -1) {
        if (isTopup) {
          // 1. Cüzdan Bakiyesi Yükleme
          users[userIndex].balance = (Number(users[userIndex].balance || 0) + amount).toFixed(2);
          fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
        } else {
          // 2. Doğrudan Lisans Teslimatı
          if (fs.existsSync(LICENSES_FILE)) {
            const licenses = JSON.parse(fs.readFileSync(LICENSES_FILE, 'utf-8'));
            const newKey = `DEXX-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
            
            licenses.push({
              id: Date.now().toString(),
              userId: users[userIndex].id,
              key: newKey,
              productTitle: customFields.productTitle || 'Digital License',
              status: 'active',
              purchasedAt: new Date().toISOString()
            });

            fs.writeFileSync(LICENSES_FILE, JSON.stringify(licenses, null, 2), 'utf-8');
          }
        }
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (err: any) {
    console.error('SellAuth Webhook Hatası:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}