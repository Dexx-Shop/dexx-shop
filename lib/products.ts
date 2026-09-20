import { supabaseAdmin } from './supabase';

export interface ProductPricing {
  daily: number;
  weekly: number;
  monthly: number;
  lifetime?: number;
}

export interface ProductPackage {
  id: string;
  name: string;
  price: number;
  badge?: string;
}

export interface FeatureCategory {
  title: string;
  items: string[];
}

export interface Product {
  id: string;
  title: string;
  game: string;
  image: string;
  description: string;
  securityTag: string;
  status?: 'active' | 'updating' | 'inactive';
  packages?: ProductPackage[];
  pricing: ProductPricing;
  media?: string[];
  videoUrl?: string;
  features?: FeatureCategory[];
  systemReqs?: {
    os: string;
    cpu: string;
  };
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
      status: p.status || 'active',
      packages: p.packages || [],
      pricing: p.pricing || { daily: 0, weekly: 0, monthly: 0 },
      media: p.media || (p.image ? [p.image] : []),
      videoUrl: p.video_url || '',
      features: p.features || [],
      systemReqs: p.system_reqs || { os: 'Windows 10 / 11', cpu: 'Intel / AMD' },
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
      packages: data.packages || [],
      pricing: data.pricing || { daily: 0, weekly: 0, monthly: 0 },
      media: data.media || (data.image ? [data.image] : []),
      videoUrl: data.video_url || '',
      features: data.features || [],
      systemReqs: data.system_reqs || { os: 'Windows 10 / 11', cpu: 'Intel / AMD' },
      stock: data.stock || { daily: true, weekly: true, monthly: true, lifetime: true },
    };
  } catch {
    return null;
  }
}

export async function insertProduct(product: any): Promise<boolean> {
  const { error } = await supabaseAdmin.from('products').insert({
    id: product.id,
    title: product.title,
    game: product.game,
    image: product.image,
    description: product.description,
    security_tag: product.securityTag,
    status: product.status || 'active',
    packages: product.packages || [],
    pricing: product.pricing,
    media: product.media || [product.image],
    video_url: product.videoUrl || '',
    features: product.features || [],
    system_reqs: product.systemReqs || { os: 'Windows 10 / 11', cpu: 'Intel / AMD' }
  });

  if (error) {
    console.error('Supabase insert hatası:', error.message);
    throw new Error(error.message);
  }
  return true;
}

export async function updateProductInDb(product: any): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('products')
    .update({
      title: product.title,
      game: product.game,
      image: product.image,
      description: product.description,
      security_tag: product.securityTag,
      status: product.status || 'active',
      packages: product.packages || [],
      pricing: product.pricing,
      media: product.media || [product.image],
      video_url: product.videoUrl || '',
      features: product.features || [],
      system_reqs: product.systemReqs || { os: 'Windows 10 / 11', cpu: 'Intel / AMD' }
    })
    .eq('id', product.id);

  if (error) {
    console.error('Supabase update hatası:', error.message);
    throw new Error(error.message);
  }
  return true;
}

export async function removeProductById(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}