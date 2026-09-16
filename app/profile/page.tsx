import { getCurrentUser } from 'lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { logoutAction } from '../auth/actions';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-white">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold">Kullanıcı Profili</h1>
          <p className="text-xs text-neutral-400 mt-1">Hesap bilgilerinizi buradan görüntüleyebilirsiniz</p>
        </div>
        <Link
          href="/"
          className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-1.5 rounded-md transition"
        >
          ← Mağazaya Dön
        </Link>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-neutral-800">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-red-950">
            {user.fullName ? user.fullName[0].toUpperCase() : user.username[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user.fullName || user.username}</h2>
            <p className="text-xs text-red-500 font-mono">@{user.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-neutral-950/60 border border-neutral-800/80 p-3.5 rounded-xl">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 block mb-1">Ad Soyad</span>
            <span className="text-sm font-medium text-neutral-200">{user.fullName || '-'}</span>
          </div>

          <div className="bg-neutral-950/60 border border-neutral-800/80 p-3.5 rounded-xl">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 block mb-1">Kullanıcı Adı</span>
            <span className="text-sm font-medium text-neutral-200">@{user.username}</span>
          </div>

          <div className="bg-neutral-950/60 border border-neutral-800/80 p-3.5 rounded-xl">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 block mb-1">Gmail Adresi</span>
            <span className="text-sm font-medium text-neutral-200">{user.email}</span>
          </div>

          <div className="bg-neutral-950/60 border border-neutral-800/80 p-3.5 rounded-xl">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 block mb-1">Referans Kodu</span>
            <span className="text-sm font-medium text-neutral-200">{user.refCode || 'Belirtilmedi'}</span>
          </div>

          <div className="bg-neutral-950/60 border border-neutral-800/80 p-3.5 rounded-xl sm:col-span-2">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 block mb-1">Kayıt Tarihi</span>
            <span className="text-sm font-medium text-neutral-300">
              {new Date(user.createdAt).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-800 flex justify-end">
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs bg-red-950/50 border border-red-800/80 text-red-300 hover:bg-red-900 px-4 py-2 rounded-lg transition cursor-pointer font-medium"
            >
              Hesaptan Çıkış Yap
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}