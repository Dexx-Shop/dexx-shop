'use client';

import { useEffect, useState } from 'react';

export default function AdminHeroSettings() {
  const [badgeText, setBadgeText] = useState('');
  const [userCount, setUserCount] = useState('');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        setBadgeText(data.heroBadge || '');
        setUserCount(data.heroUserCount || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroBadge: badgeText,
          heroUserCount: userCount
        })
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      alert('Ayarlar kaydedilirken bir hata oluştu!');
    }
  };

  if (loading) {
    return (
      <div className="p-5 rounded-2xl bg-[#0e0e11] border border-white/[0.06] text-xs text-neutral-500">
        Ayarlar yükleniyor...
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-[#0e0e11] border border-white/[0.08] shadow-xl max-w-xl space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-white tracking-tight">
          Hero Canlı Duyuru ve Metin Ayarları
        </h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          Anasayfadaki en üst yeşil ışıklı hap rozetini ve kullanıcı sayacını buradan yönetebilirsiniz.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-[11px] text-neutral-400 font-medium block mb-1.5">
            Duyuru Rozeti Metni
          </label>
          <input
            type="text"
            value={badgeText}
            onChange={(e) => setBadgeText(e.target.value)}
            placeholder="Örn: DexX Kernel v2.4 Yayında"
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-black/60 border border-white/[0.1] text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/40 transition"
          />
        </div>

        <div>
          <label className="text-[11px] text-neutral-400 font-medium block mb-1.5">
            Kullanıcı Sayacı Metni
          </label>
          <input
            type="text"
            value={userCount}
            onChange={(e) => setUserCount(e.target.value)}
            placeholder="Örn: 2,000+"
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-black/60 border border-white/[0.1] text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/40 transition"
          />
        </div>

        <div className="pt-1 flex items-center justify-between">
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold tracking-tight transition cursor-pointer"
          >
            Değişiklikleri Kaydet
          </button>

          {saved && (
            <span className="text-xs text-emerald-400 font-medium animate-fade-in">
              ✓ Başarıyla güncellendi!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}