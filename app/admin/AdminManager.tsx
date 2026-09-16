'use client';

import { User } from 'lib/auth';
import { useState } from 'react';
import { addAdminAction, removeAdminAction } from './actions';

export default function AdminManager({
  admins,
  isOwner
}: {
  admins: User[];
  isOwner: boolean;
}) {
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState<'admin' | 'moderator'>('admin');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredAdmins = admins.filter(
    (a) =>
      a.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleAddAdmin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await addAdminAction(formData);

    if (!res.success) {
      setMessage({ type: 'error', text: res.error || 'İşlem başarısız.' });
    } else {
      setMessage({ type: 'success', text: 'Yönetici başarıyla eklendi / güncellendi.' });
      setEmailInput('');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Üst Bar: Arama & Yeni Ekleme */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 relative">
          <input
            type="text"
            placeholder="Admin veya Gmail ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 transition"
          />
          <span className="absolute right-4 top-3.5 text-neutral-500 text-sm">🔍</span>
        </div>

        {isOwner && (
          <form onSubmit={handleAddAdmin} className="lg:col-span-2 flex flex-col sm:flex-row gap-2">
            <input
              name="email"
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Yetki verilecek Gmail adresi..."
              className="flex-1 bg-neutral-900/80 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 transition"
            />
            <select
              name="role"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value as any)}
              className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-3 text-sm text-neutral-300 focus:outline-none focus:border-red-600 cursor-pointer"
            >
              <option value="admin">Yönetici (Admin)</option>
              <option value="moderator">Moderatör</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-3 rounded-xl text-sm transition shadow-lg shadow-red-950 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {loading ? 'İşleniyor...' : '+ Yetki Ver'}
            </button>
          </form>
        )}
      </div>

      {message && (
        <div
          className={`text-xs p-3.5 rounded-xl border flex items-center gap-2 ${
            message.type === 'error'
              ? 'bg-red-950/60 border-red-800/80 text-red-300'
              : 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Admin Kartları Listesi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAdmins.map((admin) => {
          const isSelected = selectedAdmin?.id === admin.id;
          const roleBadgeColor =
            admin.role === 'owner'
              ? 'bg-red-500/10 text-red-400 border-red-500/30'
              : admin.role === 'admin'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30';

          return (
            <div
              key={admin.id}
              onClick={() => setSelectedAdmin(admin)}
              className={`group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer backdrop-blur-md ${
                isSelected
                  ? 'bg-neutral-900 border-red-600 shadow-xl shadow-red-950/30 ring-1 ring-red-600'
                  : 'bg-neutral-900/60 border-neutral-800/90 hover:border-neutral-700 hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-neutral-800 to-neutral-700 flex items-center justify-center font-black text-lg text-white border border-neutral-700 group-hover:border-red-600/50 transition">
                  {admin.username[0].toUpperCase()}
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${roleBadgeColor}`}>
                  {admin.role === 'owner' ? '👑 Kurucu' : admin.role === 'admin' ? '🛡️ Admin' : '⚔️ Moderatör'}
                </span>
              </div>

              {/* Kullanıcı Adı Büyük, Mail Küçük */}
              <h3 className="text-lg font-black text-white group-hover:text-red-400 transition tracking-tight">
                {admin.username}
              </h3>
              <p className="text-xs text-neutral-400 font-mono truncate mb-4">
                {admin.email}
              </p>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-3 border-t border-neutral-800/80">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Aktif
                </span>
                <span>Detayları Gör →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Detay Modal / Kartı */}
      {selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedAdmin(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white text-lg bg-neutral-800 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-red-950">
                {selectedAdmin.username[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-white">{selectedAdmin.username}</h2>
                  <span className="text-xs text-red-400 font-bold px-2 py-0.5 rounded bg-red-950/60 border border-red-800/60">
                    {selectedAdmin.role?.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">{selectedAdmin.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-neutral-950/80 border border-neutral-800/80 p-3.5 rounded-xl">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">Ad Soyad</span>
                <span className="text-sm font-semibold text-white">{selectedAdmin.fullName || '-'}</span>
              </div>

              <div className="bg-neutral-950/80 border border-neutral-800/80 p-3.5 rounded-xl">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">Durum</span>
                <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Çevrimiçi
                </span>
              </div>

              <div className="bg-neutral-950/80 border border-neutral-800/80 p-3.5 rounded-xl">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">Adminlik Başlangıcı</span>
                <span className="text-xs font-mono text-neutral-300">
                  {selectedAdmin.adminSince
                    ? new Date(selectedAdmin.adminSince).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Kuruluş'}
                </span>
              </div>

              <div className="bg-neutral-950/80 border border-neutral-800/80 p-3.5 rounded-xl">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">Kayıt Tarihi</span>
                <span className="text-xs font-mono text-neutral-300">
                  {new Date(selectedAdmin.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Yetki Kaldırma Butonu */}
            {isOwner && selectedAdmin.role !== 'owner' && (
              <button
                onClick={async () => {
                  if (confirm(`${selectedAdmin.username} adlı kullanıcının admin yetkisini almak istediğinize emin misiniz?`)) {
                    await removeAdminAction(selectedAdmin.id);
                    setSelectedAdmin(null);
                  }
                }}
                className="w-full bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 py-3 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Bu Kullanıcının Admin Yetkisini Al
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}