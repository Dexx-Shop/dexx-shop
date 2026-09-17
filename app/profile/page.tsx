import fs from 'fs';
import { getCurrentUser } from 'lib/auth';
import { getUserBalance, getUserLicenses } from 'lib/wallet';
import { redirect } from 'next/navigation';
import path from 'path';
import ProfileClientView from './ProfileClientView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProfilePage() {
  // 1. KESİN OTURUM DOĞRULAMA (lib/auth.ts ile uyumlu)
  const user = await getCurrentUser();

  if (!user || !user.id || !user.email) {
    redirect('/login');
  }

  // 2. Güncel Bakiye
  let balance = 0.0;
  try {
    balance = await getUserBalance(user.id);
  } catch {
    balance = 0.0;
  }

  // 3. Kullanıcının Lisansları
  let userLicenses: any[] = [];
  try {
    userLicenses = await getUserLicenses(user.id);
  } catch {
    userLicenses = [];
  }

  // 4. data/products.json dosyasından ürün fotoğraflarını çek ve lisanslarla eşleştir
  let products: any[] = [];
  try {
    const productsPath = path.join(process.cwd(), 'data', 'products.json');
    if (fs.existsSync(productsPath)) {
      products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    }
  } catch {}

  const enrichedLicenses = userLicenses.map((lic: any) => {
    // Eşleşen ürünü bul
    const matchedProduct = products.find((p: any) => {
      const pTitle = (p.title || p.name || '').toLowerCase();
      const licTitle = (lic.productTitle || '').toLowerCase();
      const pGame = (p.game || '').toLowerCase();
      const licGame = (lic.game || '').toLowerCase();

      return (
        (lic.productId && p.id === lic.productId) ||
        (licTitle && pTitle && (pTitle.includes(licTitle) || licTitle.includes(pTitle))) ||
        (licGame && pGame && pGame === licGame)
      );
    });

    return {
      ...lic,
      image: lic.image || matchedProduct?.image || matchedProduct?.imageUrl || matchedProduct?.banner || null
    };
  });

  return (
    <ProfileClientView
      user={{
        id: user.id,
        username: user.username || user.fullName || user.email.split('@')[0],
        email: user.email,
        balance: Number(balance).toFixed(2)
      }}
      licenses={enrichedLicenses}
      orders={[]}
    />
  );
}