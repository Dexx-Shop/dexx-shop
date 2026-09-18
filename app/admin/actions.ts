'use server';

import fs from 'fs';
import { getCurrentUser, User, UserRole } from 'lib/auth';
import { getProducts, Product, saveProducts } from 'lib/products';
import { createCoupon, getCoupons } from 'lib/wallet';
import { revalidatePath } from 'next/cache';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

function getUsers(): User[] {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveUsers(users: User[]) {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// -------------------------------------------------------------
// 1. ADMIN & YETKİ YÖNETİMİ
// -------------------------------------------------------------

export async function addAdminAction(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'owner') {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmuyor (Sadece Owner).' };
  }

  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const role = (formData.get('role') as UserRole) || 'admin';

  if (!email) return { success: false, error: 'E-posta adresi zorunludur.' };

  const users = getUsers();
  const targetUserIndex = users.findIndex((u) => u.email.toLowerCase() === email);

  if (targetUserIndex === -1) {
    return { success: false, error: 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.' };
  }

  if (users[targetUserIndex]?.role === 'owner') {
    return { success: false, error: 'Owner yetkisi değiştirilemez.' };
  }

  users[targetUserIndex]!.role = role;
  saveUsers(users);

  revalidatePath('/admin');
  return { success: true };
}

export async function removeAdminAction(userId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'owner') {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmuyor.' };
  }

  const users = getUsers();
  const targetUserIndex = users.findIndex((u) => u.id === userId);

  if (targetUserIndex === -1) return { success: false, error: 'Kullanıcı bulunamadı.' };
  if (users[targetUserIndex]?.role === 'owner') return { success: false, error: 'Owner yetkisi kaldırılamaz.' };

  users[targetUserIndex]!.role = 'user';
  saveUsers(users);

  revalidatePath('/admin');
  return { success: true };
}

// -------------------------------------------------------------
// 2. ÜRÜN & MOD YÖNETİMİ (EKLEME, DÜZENLEME, SİLME)
// -------------------------------------------------------------

export async function addProductAction(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'admin' && currentUser.role !== 'moderator')) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmuyor.' };
  }

  const title = (formData.get('title') as string)?.trim();
  const game = (formData.get('game') as string)?.trim().toUpperCase();
  const image = (formData.get('image') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const securityTag = (formData.get('securityTag') as string)?.trim() || 'Undetected';

  const dailyPrice = parseFloat(formData.get('price_daily') as string) || 0;
  const weeklyPrice = parseFloat(formData.get('price_weekly') as string) || 0;
  const monthlyPrice = parseFloat(formData.get('price_monthly') as string) || 0;

  if (!title || !game || !image) {
    return { success: false, error: 'Başlık, oyun kategorisi ve görsel bağlantısı zorunludur.' };
  }

  const products = await getProducts();
  const newProduct: Product = {
    id: `prod_${Date.now()}`,
    title,
    game,
    image,
    description: description || '',
    securityTag,
    pricing: {
      daily: dailyPrice,
      weekly: weeklyPrice,
      monthly: monthlyPrice
    }
  };

  products.unshift(newProduct);
  await saveProducts(products);

  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
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
  const description = (formData.get('description') as string)?.trim();
  const securityTag = (formData.get('securityTag') as string)?.trim() || 'Undetected';

  const dailyPrice = parseFloat(formData.get('price_daily') as string) || 0;
  const weeklyPrice = parseFloat(formData.get('price_weekly') as string) || 0;
  const monthlyPrice = parseFloat(formData.get('price_monthly') as string) || 0;

  if (!id || !title || !game || !image) {
    return { success: false, error: 'Tüm zorunlu alanları doldurun.' };
  }

  const products = await getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return { success: false, error: 'Ürün bulunamadı.' };

  products[index] = {
    ...products[index]!,
    title,
    game,
    image,
    description: description || '',
    securityTag,
    pricing: {
      daily: dailyPrice,
      weekly: weeklyPrice,
      monthly: monthlyPrice
    }
  };

  await saveProducts(products);
  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function deleteProductAction(productId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'admin' && currentUser.role !== 'moderator')) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmuyor.' };
  }

  const products = await getProducts();
  const updated = products.filter((p) => p.id !== productId);
  await saveProducts(updated);

  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export const createProductAction = addProductAction;
export const removeProductAction = deleteProductAction;

// -------------------------------------------------------------
// 3. BAKİYE KUPONU YÖNETİMİ (OWNER)
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
    console.error('Kupon üretim hatası:', err);
    return { success: false, error: err?.message || 'Kupon veritabanına eklenemedi.' };
  }
}

export async function getCouponsAction() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
    return [];
  }
  return await getCoupons();
}

// Sipariş ve Key Loglarını Getir (Sadece Owner ve Admin)
export async function getOrderLogsAction() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
    return [];
  }

  const ordersFile = path.join(process.cwd(), 'data', 'orders.json');
  try {
    if (!fs.existsSync(ordersFile)) return [];
    const raw = fs.readFileSync(ordersFile, 'utf-8');
    const orders = JSON.parse(raw);
    return orders;
  } catch {
    return [];
  }
}