'use server';

import fs from 'fs';
import { assignAdminRole, getCurrentUser, revokeAdminRole } from 'lib/auth';
import { addProduct, deleteProduct, ProductStatus, updateProduct } from 'lib/products';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import path from 'path';

export async function createProductAction(formData: FormData) {
  const title = formData.get('title') as string;
  const game = (formData.get('game') as string || 'GENEL').toUpperCase();
  const securityTag = (formData.get('securityTag') as string || 'Undetected');
  const status = (formData.get('status') as ProductStatus) || 'active';
  
  const daily = parseFloat(formData.get('price_daily') as string) || 0;
  const weekly = parseFloat(formData.get('price_weekly') as string) || 0;
  const monthly = parseFloat(formData.get('price_monthly') as string) || 0;
  const lifetime = parseFloat(formData.get('price_lifetime') as string) || 0;

  const stock_daily = formData.get('stock_daily') === 'on';
  const stock_weekly = formData.get('stock_weekly') === 'on';
  const stock_monthly = formData.get('stock_monthly') === 'on';
  const stock_lifetime = formData.get('stock_lifetime') === 'on';

  const description = formData.get('description') as string;
  const imageFile = formData.get('imageFile') as File | null;
  const imageUrlInput = formData.get('imageUrl') as string;

  if (!title) throw new Error('Ürün adı zorunludur.');

  let finalImagePath = imageUrlInput || '';

  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const extension = path.extname(imageFile.name) || '.jpg';
    const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e4)}${extension}`;
    fs.writeFileSync(path.join(uploadDir, uniqueFileName), buffer);
    finalImagePath = `/uploads/${uniqueFileName}`;
  }

  if (!finalImagePath) {
    finalImagePath = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop';
  }

  await addProduct({
    title,
    game,
    securityTag,
    status,
    pricing: { daily, weekly, monthly, lifetime },
    stock: {
      daily: stock_daily,
      weekly: stock_weekly,
      monthly: stock_monthly,
      lifetime: stock_lifetime
    },
    description: description || '',
    image: finalImagePath
  });

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/status');
}

export async function updateProductAction(formData: FormData) {
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const game = (formData.get('game') as string || 'GENEL').toUpperCase();
  const securityTag = (formData.get('securityTag') as string || 'Undetected');
  const status = (formData.get('status') as ProductStatus) || 'active';
  
  const daily = parseFloat(formData.get('price_daily') as string) || 0;
  const weekly = parseFloat(formData.get('price_weekly') as string) || 0;
  const monthly = parseFloat(formData.get('price_monthly') as string) || 0;
  const lifetime = parseFloat(formData.get('price_lifetime') as string) || 0;

  const stock_daily = formData.get('stock_daily') === 'on';
  const stock_weekly = formData.get('stock_weekly') === 'on';
  const stock_monthly = formData.get('stock_monthly') === 'on';
  const stock_lifetime = formData.get('stock_lifetime') === 'on';

  const description = formData.get('description') as string;
  const imageFile = formData.get('imageFile') as File | null;
  const currentImage = formData.get('currentImage') as string;

  let finalImagePath = currentImage;

  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const extension = path.extname(imageFile.name) || '.jpg';
    const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e4)}${extension}`;
    fs.writeFileSync(path.join(uploadDir, uniqueFileName), buffer);
    finalImagePath = `/uploads/${uniqueFileName}`;
  }

  await updateProduct(id, {
    title,
    game,
    securityTag,
    status,
    pricing: { daily, weekly, monthly, lifetime },
    stock: {
      daily: stock_daily,
      weekly: stock_weekly,
      monthly: stock_monthly,
      lifetime: stock_lifetime
    },
    description: description || '',
    image: finalImagePath
  });

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/status');
  redirect('/admin');
}

export async function removeProductAction(id: string) {
  await deleteProduct(id);
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/status');
}

export async function addAdminAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'owner') {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }

  const email = (formData.get('email') as string || '').trim();
  const role = (formData.get('role') as 'admin' | 'moderator') || 'admin';

  const res = await assignAdminRole(email, role);
  revalidatePath('/admin');
  return res;
}

export async function removeAdminAction(userId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'owner') return;

  await revokeAdminRole(userId);
  revalidatePath('/admin');
}