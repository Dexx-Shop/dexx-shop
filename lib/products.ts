import fs from 'fs';
import path from 'path';

export interface ProductPricing {
  daily?: number;
  weekly?: number;
  monthly?: number;
}

export interface Product {
  id: string;
  title: string;
  game: string;
  image: string;
  description?: string;
  securityTag?: string;
  pricing: ProductPricing;
}

const PRODUCTS_FILE = path.join(process.cwd(), 'data', 'products.json');

// Dosya ve klasör yoksa oluştur
function ensureProductsFile() {
  const dir = path.dirname(PRODUCTS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(PRODUCTS_FILE)) {
    // Başlangıç varsayılan ürünleri
    const defaultProducts: Product[] = [
      {
        id: 'prod_rust_1',
        title: 'DexX Rust Private Suite',
        game: 'RUST',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        description: 'Kernel level bypass, Silent Aim, ESP & Recoil Control.',
        securityTag: 'Undetected',
        pricing: { daily: 6.99, weekly: 19.99, monthly: 39.99 }
      },
      {
        id: 'prod_fivem_1',
        title: 'DexX FiveM Enhanced ESP',
        game: 'FIVEM',
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
        description: 'Roleplay uyumlu, stream-proof oyuncu & araç ESP.',
        securityTag: 'Undetected',
        pricing: { daily: 4.99, weekly: 14.99, monthly: 29.99 }
      }
    ];
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(defaultProducts, null, 2));
  }
}

// Ürünleri Listele
export async function getProducts(): Promise<Product[]> {
  ensureProductsFile();
  try {
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Tek Ürün Getir
export async function getProduct(id: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.id === id);
}

// Ürünleri Kaydet (Export eksik olan yer burasıydı)
export async function saveProducts(products: Product[]): Promise<void> {
  ensureProductsFile();
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

// En Düşük Fiyatı Hesapla
export function getLowestPrice(pricing: ProductPricing): number {
  const prices = [pricing.daily, pricing.weekly, pricing.monthly].filter(
    (p): p is number => typeof p === 'number' && p > 0
  );
  if (prices.length === 0) return 0;
  return Math.min(...prices);
}

export async function getProductById(id: string) {
  return getProduct(id);
}