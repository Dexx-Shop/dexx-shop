import { supabaseAdmin } from './supabase';

export interface ProductPricing {
  daily: number;
  weekly: number;
  monthly: number;
  lifetime?: number;
}

export interface Product {
  id: string;
  title: string;
  game: string;
  image: string;
  description: string;
  securityTag: string;
  status?: 'active' | 'updating' | 'inactive';
  pricing: ProductPricing;
  stock?: {
    daily?: boolean;
    weekly?: boolean;
    monthly?: boolean;
    lifetime?: boolean;
  };
}

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((p: any) => ({
      id: p.id,
      title: p.title,
      game: p.game,
      image: p.image,
      description: p.description || '',
      securityTag: p.security_tag || 'Undetected',
      status: p.status || 'active', // Varsayılan olarak active (Güvenli)
      pricing: p.pricing || { daily: 0, weekly: 0, monthly: 0 },
      stock: p.stock || { daily: true, weekly: true, monthly: true, lifetime: true },
    }));
  } catch {
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      game: data.game,
      image: data.image,
      description: data.description || '',
      securityTag: data.security_tag || 'Undetected',
      status: data.status || 'active',
      pricing: data.pricing || { daily: 0, weekly: 0, monthly: 0 },
      stock: data.stock || { daily: true, weekly: true, monthly: true, lifetime: true },
    };
  } catch {
    return null;
  }
}

export async function insertProduct(product: Product): Promise<boolean> {
  const { error } = await supabaseAdmin.from('products').insert({
    id: product.id,
    title: product.title,
    game: product.game,
    image: product.image,
    description: product.description,
    security_tag: product.securityTag,
    status: product.status || 'active',
    pricing: product.pricing,
  });

  if (error) {
    console.error('Supabase ürün ekleme hatası:', error.message);
    throw new Error(error.message);
  }
  return true;
}

export async function updateProductInDb(product: Product): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('products')
    .update({
      title: product.title,
      game: product.game,
      image: product.image,
      description: product.description,
      security_tag: product.securityTag,
      status: product.status || 'active',
      pricing: product.pricing,
    })
    .eq('id', product.id);

  if (error) {
    console.error('Supabase ürün güncelleme hatası:', error.message);
    throw new Error(error.message);
  }
  return true;
}

export async function removeProductById(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
  if (error) {
    console.error('Supabase ürün silme hatası:', error.message);
    throw new Error(error.message);
  }
  return true;
}