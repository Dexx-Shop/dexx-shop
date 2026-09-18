import crypto from 'crypto';
import { supabaseAdmin } from './supabase';

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
  try {
    const { data, error } = await supabaseAdmin
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return 0.0;
    }

    return Number(data.balance) || 0.0;
  } catch {
    return 0.0;
  }
}

export async function updateUserBalance(userId: string, delta: number): Promise<number> {
  if (!userId) {
    console.error('updateUserBalance: userId bulunamadı!');
    return 0.0;
  }

  const cleanUserId = String(userId).trim();

  try {
    const currentBalance = await getUserBalance(cleanUserId);
    const nextBalance = Math.max(0, Number((currentBalance + delta).toFixed(2)));

    // Upsert ile varsa güncelle, yoksa tek sorguda oluştur
    const { data, error } = await supabaseAdmin
      .from('wallets')
      .upsert(
        {
          user_id: cleanUserId,
          balance: nextBalance,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Supabase wallets upsert hatası:', error.message, error.details);
      return currentBalance;
    }

    return nextBalance;
  } catch (err) {
    console.error('updateUserBalance beklenmeyen hata:', err);
    return 0.0;
  }
}

export async function getCoupons(): Promise<Coupon[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('balance_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((c) => ({
      code: c.code,
      amount: Number(c.amount),
      isUsed: c.is_used,
      usedBy: c.used_by,
      usedAt: c.used_at,
      createdAt: c.created_at,
    }));
  } catch {
    return [];
  }
}

export async function createCoupon(amount: number): Promise<Coupon> {
  const newCoupon: Coupon = {
    code: generateCouponCode(),
    amount: Number(amount.toFixed(2)),
    isUsed: false,
    createdAt: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin.from('balance_codes').insert({
    code: newCoupon.code,
    amount: newCoupon.amount,
    is_used: false,
  });

  if (error) {
    console.error('Supabase balance_codes insert error:', error);
    throw new Error(`Veritabanı hatası: ${error.message}`);
  }

  return newCoupon;
}

export async function redeemCoupon(
  userId: string,
  code: string
): Promise<{ success: boolean; amount?: number; error?: string }> {
  const cleanCode = code.trim().toUpperCase();

  try {
    const { data: coupon, error: fetchError } = await supabaseAdmin
      .from('balance_codes')
      .select('*')
      .eq('code', cleanCode)
      .maybeSingle();

    if (fetchError || !coupon) {
      return { success: false, error: 'Geçersiz bakiye kodu.' };
    }

    if (coupon.is_used) {
      return { success: false, error: 'Bu kod daha önce kullanılmış veya geçersiz.' };
    }

    // 1. Önce doğrudan used_by ile işaretlemeyi dene
    const { error: updateError } = await supabaseAdmin
      .from('balance_codes')
      .update({
        is_used: true,
        used_by: userId || null,
        used_at: new Date().toISOString(),
      })
      .eq('code', cleanCode);

    // 2. Eğer used_by foreign key / tür uyuşmazlığı verirse used_by olmadan işaretle
    if (updateError) {
      console.warn('used_by uyuşmazlığı, fallback güncelleme yapılıyor:', updateError.message);
      const { error: fallbackError } = await supabaseAdmin
        .from('balance_codes')
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
        })
        .eq('code', cleanCode);

      if (fallbackError) {
        return { success: false, error: `Kod güncellenemedi: ${fallbackError.message}` };
      }
    }

    // 3. Kullanıcı bakiyesine ekle
    const amount = Number(coupon.amount);
    await updateUserBalance(userId, amount);

    return { success: true, amount };
  } catch (err: any) {
    console.error('Bozdurma hatası:', err);
    return { success: false, error: err?.message || 'İşlem sırasında beklenmeyen bir hata oluştu.' };
  }
}

export async function getUserLicenses(userId: string): Promise<UserLicense[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('licenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    const now = Date.now();

    return data.map((l) => ({
      id: l.id,
      userId: l.user_id,
      key: l.license_key,
      productTitle: l.product_id,
      game: l.product_id.toUpperCase().includes('RUST')
        ? 'RUST'
        : l.product_id.toUpperCase().includes('FIVEM')
        ? 'FIVEM'
        : 'GLOBAL',
      tier: l.duration || 'Standart',
      durationDays: 1,
      activatedAt: l.created_at,
      expiresAt: l.expires_at || l.created_at,
      status: l.expires_at && new Date(l.expires_at).getTime() < now ? 'expired' : 'active',
    }));
  } catch {
    return [];
  }
}

export async function activateLicenseKey(
  userId: string,
  keyInput: string
): Promise<{ success: boolean; license?: UserLicense; error?: string }> {
  const cleanKey = keyInput.trim().toUpperCase();

  if (cleanKey.length < 8) {
    return { success: false, error: 'Geçersiz lisans anahtarı formatı.' };
  }

  try {
    const { data: existing } = await supabaseAdmin
      .from('licenses')
      .select('id')
      .eq('license_key', cleanKey)
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'Bu lisans anahtarı zaten kullanılmış veya hesabınıza tanımlı.' };
    }

    const durationDays = 30;
    const activatedAtDate = new Date();
    const expiresAtDate = new Date(activatedAtDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('licenses')
      .insert({
        user_id: userId,
        product_id: 'DexX Private Modification',
        license_key: cleanKey,
        duration: 'Aylık',
        status: 'active',
        expires_at: expiresAtDate.toISOString(),
      })
      .select()
      .maybeSingle();

    if (insertError || !inserted) {
      return { success: false, error: 'Lisans tanımlanamadı.' };
    }

    const newLicense: UserLicense = {
      id: inserted.id,
      userId: inserted.user_id,
      key: inserted.license_key,
      productTitle: inserted.product_id,
      game: 'GLOBAL',
      tier: inserted.duration,
      durationDays,
      activatedAt: inserted.created_at,
      expiresAt: inserted.expires_at,
      status: 'active',
    };

    return { success: true, license: newLicense };
  } catch {
    return { success: false, error: 'Lisans aktifleştirilirken hata oluştu.' };
  }
}