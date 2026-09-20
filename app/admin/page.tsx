import fs from 'fs';
import { getCurrentUser } from 'lib/auth';
import { getProducts } from 'lib/products';
import { getCoupons } from 'lib/wallet';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import path from 'path';

import { getOrderLogsAction } from './actions';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

function getAllUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'owner' && user.role !== 'admin' && user.role !== 'moderator')) {
    redirect('/login');
  }

  const isOwner = user.role === 'owner';
  const products = await getProducts();
  const allUsers = getAllUsers();
  const admins = allUsers.filter((u: any) => u.role === 'owner' || u.role === 'admin' || u.role === 'moderator');
  const coupons = await getCoupons();
  const orderLogs = await getOrderLogsAction();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white pb-24 px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Üst Karşılama Barı */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                DexX Yönetim Paneli
              </h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Giriş yapan: <strong className="text-white">@{user.username || user.email}</strong> (Yetki:{' '}
              <span className="uppercase text-red-500 font-bold">{user.role}</span>)
            </p>
          </div>

          <Link
            href="/"
            className="text-xs px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 transition w-fit"
          >
            ← Mağazaya Dön
          </Link>
        </div>

        {/* Sol Menülü & Sekmeli Dinamik Yönetim Paneli */}
        <AdminDashboardClient
          user={user}
          isOwner={isOwner}
          products={products}
          admins={admins}
          coupons={coupons}
          orderLogs={orderLogs}
        />

      </div>
    </div>
  );
}