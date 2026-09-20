'use server';

import { getCurrentUser, UserRole } from 'lib/auth';
import { insertProduct, removeProductById, updateProductInDb } from 'lib/products';
import { supabaseAdmin } from 'lib/supabase';
import { createCoupon, getCoupons } from 'lib/wallet';
import { revalidatePath } from 'next/cache';

// -------------------------------------------------------------
// 1. ADMIN & YETKİ YÖNETİMİ (SUPABASE)
// -------------------------------------------------------------

export async function addAdminAction(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'owner') {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmuyor (Sadece Owner).' };
  }

  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const role = (formData.get('role') as UserRole) || 'admin';

  if (!email) return { success: false, error: 'E-posta adresi zorunludur.' };

  const { data: user, error: fetchErr } = await supabaseAdmin
    .from('users')
    .select('*')
    .ilike('email', email)
    .maybeSingle();

  if (fetchErr || !user) {
    return { success: false, error: 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.' };
  }

  if (user.role === 'owner') {
    return { success: false, error: 'Owner yetkisi değiştirilemez.' };
  }

  const { error: updateErr } = await supabaseAdmin
    .from('users')
    .update({ role, adminSince: new Date().toISOString() })
    .eq('id', user.id);

  if (updateErr) return { success: false, error: updateErr.message };

  revalidatePath('/admin');
  return { success: true };
}

export async function removeAdminAction(userId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'owner') {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmuyor.' };
  }

  const { data: user } = await supabaseAdmin.from('users').select('*').eq('id', userId).maybeSingle();
  if (!user) return { success: false, error: 'Kullanıcı bulunamadı.' };
  if (user.role === 'owner') return { success: false, error: 'Owner yetkisi kaldırılamaz.' };

  const { error } = await supabaseAdmin.from('users').update({ role: 'user', adminSince: null }).eq('id', userId);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin');
  return { success: true };
}

// -------------------------------------------------------------
// 2. ÜRÜN & DİNAMİK PAKET YÖNETİMİ (SUPABASE)
// -------------------------------------------------------------

export async function addProductAction(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'admin' && currentUser.role !== 'moderator')) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmuyor.' };
  }

  const title = (formData.get('title') as string)?.trim();
  const game = (formData.get('game') as string)?.trim().toUpperCase();
  const image = (formData.get('image') as string)?.trim();
  const videoUrl = (formData.get('videoUrl') as string)?.trim() || '';
  const mediaRaw = (formData.get('mediaUrls') as string)?.trim() || '';
  const description = (formData.get('description') as string)?.trim();
  const securityTag = (formData.get('securityTag') as string)?.trim() || 'Undetected';
  const status = (formData.get('status') as any) || 'active';

  // Dinamik paketler JSON'ı
  const packagesJson = formData.get('packages_json') as string;
  let parsedPackages: any[] = [];
  try {
    parsedPackages = packagesJson ? JSON.parse(packagesJson) : [];
  } catch {
    parsedPackages = [];
  }

  // Geriye dönük uyumluluk fiyatları (varsa)
  const dailyPrice = parseFloat(formData.get('price_daily') as string) || (parsedPackages[0]?.price || 0);
  const weeklyPrice = parseFloat(formData.get('price_weekly') as string) || (parsedPackages[1]?.price || 0);
  const monthlyPrice = parseFloat(formData.get('price_monthly') as string) || (parsedPackages[2]?.price || 0);

  const mediaList = mediaRaw
    ? mediaRaw.split('\n').map((s) => s.trim()).filter(Boolean)
    : [image];

  if (!title || !game || !image) {
    return { success: false, error: 'Başlık, oyun kategorisi ve görsel bağlantısı zorunludur.' };
  }

  try {
    await insertProduct({
      id: `prod_${Date.now()}`,
      title,
      game,
      image,
      videoUrl,
      media: mediaList,
      description: description || '',
      securityTag,
      status,
      packages: parsedPackages,
      pricing: {
        daily: dailyPrice,
        weekly: weeklyPrice,
        monthly: monthlyPrice,
      },
    });

    revalidatePath('/admin');
    revalidatePath('/status');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Ürün eklenemedi.' };
  }
}

export async function updateProductAction(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'admin' && currentUser.role !== 'moderator')) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmuyor.' };
  }

  const id = formData.get('id') as string;
  const title = (formData.get('title') as string)?.trim();
  const game = (formData.get('game') as string)?.trim().toUpperCase();
  const image = (formData.get('image') as string)?.trim();
  const videoUrl = (formData.get('videoUrl') as string)?.trim() || '';
  const mediaRaw = (formData.get('mediaUrls') as string)?.trim() || '';
  const description = (formData.get('description') as string)?.trim();
  const securityTag = (formData.get('securityTag') as string)?.trim() || 'Undetected';
  const status = (formData.get('status') as any) || 'active';

  // Dinamik paketler JSON'ı
  const packagesJson = formData.get('packages_json') as string;
  let parsedPackages: any[] = [];
  try {
    parsedPackages = packagesJson ? JSON.parse(packagesJson) : [];
  } catch {
    parsedPackages = [];
  }

  const dailyPrice = parseFloat(formData.get('price_daily') as string) || (parsedPackages[0]?.price || 0);
  const weeklyPrice = parseFloat(formData.get('price_weekly') as string) || (parsedPackages[1]?.price || 0);
  const monthlyPrice = parseFloat(formData.get('price_monthly') as string) || (parsedPackages[2]?.price || 0);

  const mediaList = mediaRaw
    ? mediaRaw.split('\n').map((s) => s.trim()).filter(Boolean)
    : [image];

  if (!id || !title || !game || !image) {
    return { success: false, error: 'Tüm zorunlu alanları doldurun.' };
  }

  try {
    await updateProductInDb({
      id,
      title,
      game,
      image,
      videoUrl,
      media: mediaList,
      description: description || '',
      securityTag,
      status,
      packages: parsedPackages,
      pricing: {
        daily: dailyPrice,
        weekly: weeklyPrice,
        monthly: monthlyPrice,
      },
    });

    revalidatePath('/admin');
    revalidatePath('/status');
    revalidatePath(`/product/${id}`);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Ürün güncellenemedi.' };
  }
}

export async function deleteProductAction(productId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'admin' && currentUser.role !== 'moderator')) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmuyor.' };
  }

  try {
    await removeProductById(productId);
    revalidatePath('/admin');
    revalidatePath('/status');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Ürün silinemedi.' };
  }
}

export const createProductAction = addProductAction;
export const removeProductAction = deleteProductAction;

// -------------------------------------------------------------
// 3. BAKİYE KUPONU YÖNETİMİ
// -------------------------------------------------------------

export async function createCouponAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
    return { success: false, error: 'Kupon üretmek için yetkiniz bulunmuyor.' };
  }

  const amountStr = formData.get('amount') as string;
  const amount = parseFloat(amountStr);

  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: 'Lütfen geçerli bir dolar miktarı girin.' };
  }

  try {
    const newCoupon = await createCoupon(amount);
    revalidatePath('/admin');
    return { success: true, coupon: newCoupon };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Kupon oluşturulamadı.' };
  }
}

export async function getCouponsAction() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
    return [];
  }
  return await getCoupons();
}

// -------------------------------------------------------------
// 4. SİPARİŞ & LOG YÖNETİMİ
// -------------------------------------------------------------

export async function getOrderLogsAction() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
    return [];
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      username: row.username,
      deliveryEmail: row.delivery_email,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      totalAmount: Number(row.total_amount),
      status: row.status,
      createdAt: row.created_at
    }));
  } catch {
    return [];
  }
}

export async function toggleOrderStatusAction(orderId: string, currentStatus: string) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
    return { success: false, error: 'Yetkiniz bulunmuyor.' };
  }

  const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

  try {
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin');
    return { success: true, newStatus };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createBulkCouponsAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'owner') {
    return { success: false, error: 'Bu işlem için Owner yetkisi gerekiyor.' };
  }

  const amount = parseFloat(formData.get('amount') as string);
  const count = parseInt(formData.get('count') as string, 10);

  if (isNaN(amount) || amount <= 0 || isNaN(count) || count <= 0) {
    return { success: false, error: 'Geçerli bir tutar ve adet giriniz.' };
  }

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  
  const newCoupons = [];
  for (let i = 0; i < count; i++) {
    newCoupons.push({
      code: `DEXX-${segment()}-${segment()}-${segment()}`,
      amount: amount,
      isUsed: false,
      created_at: new Date().toISOString()
    });
  }

  const { data, error } = await supabaseAdmin.from('coupons').insert(newCoupons).select();
  if (error) return { success: false, error: error.message };

  return { success: true, coupons: data || newCoupons };
}