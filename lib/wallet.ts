import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const WALLET_FILE = path.join(DATA_DIR, 'wallets.json');
const COUPONS_FILE = path.join(DATA_DIR, 'coupons.json');
const LICENSES_FILE = path.join(DATA_DIR, 'licenses.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

function ensureFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(WALLET_FILE)) fs.writeFileSync(WALLET_FILE, JSON.stringify({}));
  if (!fs.existsSync(COUPONS_FILE)) fs.writeFileSync(COUPONS_FILE, JSON.stringify([]));
  if (!fs.existsSync(LICENSES_FILE)) fs.writeFileSync(LICENSES_FILE, JSON.stringify([]));
  if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
}

export interface Coupon {
  code: string;
  amount: number;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: string;
  createdAt: string;
}

export interface UserLicense {
  id: string;
  userId: string;
  key: string;
  productTitle: string;
  game: string;
  tier: string;
  durationDays: number;
  activatedAt: string;
  expiresAt: string;
  status: 'active' | 'expired';
}

export function generateCouponCode(): string {
  const segment = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `DEXX-${segment()}-${segment()}-${segment()}`;
}

export async function getUserBalance(userId: string): Promise<number> {
  ensureFiles();
  try {
    const raw = fs.readFileSync(WALLET_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return data[userId] || 0.0;
  } catch {
    return 0.0;
  }
}

export async function updateUserBalance(userId: string, delta: number): Promise<number> {
  ensureFiles();
  const raw = fs.readFileSync(WALLET_FILE, 'utf-8');
  const data = JSON.parse(raw);
  const current = data[userId] || 0.0;
  const next = Math.max(0, Number((current + delta).toFixed(2)));
  data[userId] = next;
  fs.writeFileSync(WALLET_FILE, JSON.stringify(data, null, 2));
  return next;
}

export async function getCoupons(): Promise<Coupon[]> {
  ensureFiles();
  try {
    const raw = fs.readFileSync(COUPONS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function createCoupon(amount: number): Promise<Coupon> {
  ensureFiles();
  const coupons = await getCoupons();
  const newCoupon: Coupon = {
    code: generateCouponCode(),
    amount: Number(amount.toFixed(2)),
    isUsed: false,
    createdAt: new Date().toISOString()
  };
  coupons.unshift(newCoupon);
  fs.writeFileSync(COUPONS_FILE, JSON.stringify(coupons, null, 2));
  return newCoupon;
}

export async function redeemCoupon(userId: string, code: string): Promise<{ success: boolean; amount?: number; error?: string }> {
  ensureFiles();
  const cleanCode = code.trim().toUpperCase();
  const coupons = await getCoupons();

  const couponIndex = coupons.findIndex((c) => c.code === cleanCode);
  if (couponIndex === -1) {
    return { success: false, error: 'Geçersiz bakiye kodu.' };
  }

  const coupon = coupons[couponIndex];
  if (!coupon || coupon.isUsed) {
    return { success: false, error: 'Bu kod daha önce kullanılmış veya geçersiz.' };
  }

  coupon.isUsed = true;
  coupon.usedBy = userId;
  coupon.usedAt = new Date().toISOString();
  coupons[couponIndex] = coupon;

  fs.writeFileSync(COUPONS_FILE, JSON.stringify(coupons, null, 2));
  await updateUserBalance(userId, coupon.amount);

  return { success: true, amount: coupon.amount };
}

export async function getUserLicenses(userId: string): Promise<UserLicense[]> {
  ensureFiles();
  try {
    const raw = fs.readFileSync(LICENSES_FILE, 'utf-8');
    const all: UserLicense[] = JSON.parse(raw);
    const now = new Date().getTime();

    return all
      .filter((l) => l.userId === userId)
      .map((l) => ({
        ...l,
        status: new Date(l.expiresAt).getTime() < now ? 'expired' : 'active'
      }));
  } catch {
    return [];
  }
}

export async function activateLicenseKey(
  userId: string,
  keyInput: string
): Promise<{ success: boolean; license?: UserLicense; error?: string }> {
  ensureFiles();
  const cleanKey = keyInput.trim().toUpperCase();

  if (cleanKey.length < 8) {
    return { success: false, error: 'Geçersiz lisans anahtarı formatı.' };
  }

  const licensesRaw = fs.readFileSync(LICENSES_FILE, 'utf-8');
  const allLicenses: UserLicense[] = JSON.parse(licensesRaw);

  if (allLicenses.some((l) => l.key === cleanKey)) {
    return { success: false, error: 'Bu lisans anahtarı zaten hesabınıza tanımlanmış.' };
  }

  // Sipariş kütüğünden bu key'in tam detaylarını buluyoruz
  let matchedTitle = 'DexX Private Modification';
  let matchedTier = 'Günlük';
  let matchedGame = 'GLOBAL';

  try {
    const ordersRaw = fs.readFileSync(ORDERS_FILE, 'utf-8');
    const orders = JSON.parse(ordersRaw);
    for (const order of orders) {
      const foundKey = order.keys?.find((k: any) => k.key === cleanKey);
      if (foundKey) {
        matchedTitle = foundKey.productTitle || matchedTitle;
        matchedTier = foundKey.tier || matchedTier;
        matchedGame =
          foundKey.game ||
          (matchedTitle.toUpperCase().includes('RUST')
            ? 'RUST'
            : matchedTitle.toUpperCase().includes('FIVEM')
            ? 'FIVEM'
            : matchedTitle.toUpperCase().includes('CS')
            ? 'CS2'
            : 'GLOBAL');
        break;
      }
    }
  } catch {}

  // Süre belirleme mantığı: Günlük -> 1 gün, Haftalık -> 7 gün, Aylık -> 30 gün
  let durationDays = 1;
  const tierLower = matchedTier.toLowerCase();
  if (tierLower.includes('hafta')) {
    durationDays = 7;
  } else if (tierLower.includes('ay')) {
    durationDays = 30;
  }

  const activatedAtDate = new Date();
  const expiresAtDate = new Date(activatedAtDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const newLicense: UserLicense = {
    id: `LIC-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    userId,
    key: cleanKey,
    productTitle: matchedTitle,
    game: matchedGame,
    tier: matchedTier,
    durationDays,
    activatedAt: activatedAtDate.toISOString(),
    expiresAt: expiresAtDate.toISOString(),
    status: 'active'
  };

  allLicenses.unshift(newLicense);
  fs.writeFileSync(LICENSES_FILE, JSON.stringify(allLicenses, null, 2));

  return { success: true, license: newLicense };
}