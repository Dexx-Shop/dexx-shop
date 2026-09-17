'use client';

import { addAdminAction, removeAdminAction } from 'app/admin/actions';
import { User } from 'lib/auth';
import { useState } from 'react';

export default function AdminManager({
  admins,
  currentUserId,
  isOwner
}: {
  admins: User[];
  currentUserId?: string;
  isOwner: boolean;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'moderator'>('admin');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('role', role);

    try {
      const res = await addAdminAction(formData);
      if (!res.success) {
        setError(res.error || 'Yetki verilemedi.');
      } else {
        setSuccess(`"${email}" kullanıcısına başarıyla yetki tanımlandı.`);
        setEmail('');
      }
    } catch {
      setError('Bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id: string, name: string) {
    if (!confirm(`"${name}" adlı yetkiliyi kaldırmak istediğinize emin misiniz?`)) return;
    try {
      await removeAdminAction(id);
    } catch {
      alert('İşlem gerçekleştirilemedi.');
    }
  }

  return (
    <div className="space-y-8">
      {isOwner && (
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <span>🛡️</span>
            <span>Yeni Yönetici Ekle</span>
          </h3>
          <p className="text-xs text-neutral-400 mb-6">
            Kullanıcının sitede kayıtlı olduğu e-posta adresini girerek yönetici veya moderatör yetkisi atayabilirsiniz.
          </p>

          <form onSubmit={handleAddAdmin} className="space-y-4 max-w-xl">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-semibold">
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold">
                ✓ {success}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Kullanıcı E-Posta Adresi
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@dexx.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Yetki Düzeyi
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'moderator')}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition cursor-pointer"
              >
                <option value="admin">Yönetici (Admin) - Tüm Yetkiler</option>
                <option value="moderator">Moderatör - Sadece Ürün Yönetimi</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Yetki Tanımlanıyor...' : 'Yetki Ver'}
            </button>
          </form>
        </div>
      )}

      {/* Yetkili Listesi */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>👥</span>
          <span>Mevcut Yetkililer</span>
          <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full font-normal">
            {admins.length}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {admins.map((admin) => {
            const userRole = admin.role || 'user';
            const initialLetter = admin.username?.[0]?.toUpperCase() || admin.email?.[0]?.toUpperCase() || 'U';

            return (
              <div
                key={admin.id}
                className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center font-bold text-sm text-red-500 shrink-0">
                    {initialLetter}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white truncate">
                        @{admin.username || 'Kullanıcı'}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          userRole === 'owner'
                            ? 'bg-amber-950/80 border border-amber-800 text-amber-400'
                            : userRole === 'admin'
                            ? 'bg-red-950/80 border border-red-800 text-red-400'
                            : 'bg-blue-950/80 border border-blue-800 text-blue-400'
                        }`}
                      >
                        {userRole}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 truncate mt-0.5">
                      {admin.email}
                    </p>
                  </div>
                </div>

                {isOwner && userRole !== 'owner' && admin.id !== currentUserId && (
                  <button
                    onClick={() => handleRemove(admin.id, admin.username || admin.email)}
                    title="Yetkiyi Kaldır"
                    className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-red-900 hover:text-red-400 text-neutral-500 flex items-center justify-center text-xs transition cursor-pointer shrink-0"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}