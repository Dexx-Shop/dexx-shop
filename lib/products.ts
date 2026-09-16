import fs from 'fs';
import path from 'path';

export type ProductStatus = 'active' | 'updating' | 'inactive';

export interface ProductPricing {
  daily?: number;
  weekly?: number;
  monthly?: number;
  lifetime?: number;
}

export interface ProductStock {
  daily?: boolean;
  weekly?: boolean;
  monthly?: boolean;
  lifetime?: boolean;
}

export interface Product {
  id: string;
  title: string;
  game: string;
  securityTag: string;
  status: ProductStatus;
  pricing: ProductPricing;
  stock?: ProductStock;
  features?: string[];
  description: string;
  image: string;
  createdAt: string;
}

const productsFilePath = path.join(process.cwd(), 'data', 'products.json');

function ensureProductsFile() {
  const dir = path.dirname(productsFilePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(productsFilePath)) {
    fs.writeFileSync(productsFilePath, JSON.stringify([]), 'utf-8');
  }
}

export async function getProducts(): Promise<Product[]> {
  ensureProductsFile();
  try {
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.map((p: any) => ({
      ...p,
      pricing: p.pricing || {
        daily: p.price || 5,
        weekly: (p.price || 5) * 4,
        monthly: (p.price || 5) * 12,
        lifetime: (p.price || 5) * 30
      },
      stock: p.stock || {
        daily: true,
        weekly: true,
        monthly: true,
        lifetime: true
      }
    }));
  } catch {
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => String(p.id) === String(id)) || null;
}

export async function addProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  ensureProductsFile();
  const products = await getProducts();
  const newProduct: Product = {
    id: Date.now().toString(),
    ...productData,
    createdAt: new Date().toISOString()
  };
  products.push(newProduct);
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf-8');
  return newProduct;
}

export async function updateProduct(id: string, updateData: Partial<Product>): Promise<Product | null> {
  ensureProductsFile();
  const products = await getProducts();
  const index = products.findIndex((p) => String(p.id) === String(id));
  if (index === -1) return null;

  products[index] = { ...products[index], ...updateData };
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf-8');
  return products[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  ensureProductsFile();
  const products = await getProducts();
  const filtered = products.filter((p) => String(p.id) !== String(id));
  if (filtered.length === products.length) return false;

  fs.writeFileSync(productsFilePath, JSON.stringify(filtered, null, 2), 'utf-8');
  return true;
}

export function getLowestPrice(pricing: ProductPricing): number {
  const prices = Object.values(pricing).filter((val): val is number => typeof val === 'number' && val > 0);
  if (prices.length === 0) return 0;
  return Math.min(...prices);
}