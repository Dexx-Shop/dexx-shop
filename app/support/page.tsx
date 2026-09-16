'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SupportPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    // Başarılı gönderim simülasyonu
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      setSubject('');
      setMessage('');
      setEmail('');
      setOrderId('');
    }, 600);
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-red-600 selection:text-white pb-24 px-4 sm:px-6 lg:px-8">
      {/* Üst Kısım / Hero */}
      <div className="max-w-4xl mx-auto text-center pt-4 sm:pt-8 pb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 mb-6 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
          <span className="font-semibold uppercase tracking-wider text-[11px]">MÜŞTERİ DESTEK MERKEZİ</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
          Size Nasıl Yardımcı Olabiliriz?
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Siparişleriniz, dijital lisans teslimatları veya teknik sorularınız için ekibimizle doğrudan iletişime geçebilirsiniz.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Sol Panel: Bilgi Kartları */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-6 backdrop-blur-md space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-red-950/60 border border-red-800/60 flex items-center justify-center text-lg">
              🛡️
            </div>
            <h3 className="text-base font-bold text-white">Canlı Destek Hattı</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Talepleriniz doğrudan destek panelimize iletilir ve kayıt altına alınır.
            </p>
            <span className="text-xs font-semibold text-neutral-300 block">
              7/24 Bilet Sistemi Aktif
            </span>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-6 backdrop-blur-md space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-800 flex items-center justify-center text-lg">
              ⏱️
            </div>
            <h3 className="text-base font-bold text-white">Çalışma Saatleri</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Haftanın her günü kesintisiz teknik destek.
            </p>
            <span className="text-[11px] text-emerald-400 font-semibold block">
              ● Ortalama Yanıt: 15 Dakika
            </span>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-6 backdrop-blur-md space-y-2">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Hızlı Bağlantılar</h4>
            <div className="flex flex-col gap-2 text-xs text-neutral-400">
              <Link href="/terms" className="hover:text-white transition">Kullanım Koşulları</Link>
              <Link href="/privacy" className="hover:text-white transition">Gizlilik ve İade Politikası</Link>
              <Link href="/status" className="hover:text-white transition">Hizmet Durum Tablosu</Link>
            </div>
          </div>
        </div>

        {/* Sağ Panel: Bilet Formu */}
        <div className="md:col-span-2 bg-neutral-900/40 border border-neutral-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          <h2 className="text-xl font-black text-white mb-1">Destek Talebi Oluştur</h2>
          <p className="text-xs text-neutral-400 mb-6">
            Aşağıdaki formu doldurarak ekibimize anında bildirim iletebilirsiniz.
          </p>

          {isSubmitted ? (
            <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-2xl p-8 text-center space-y-4 animate-fadeIn">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl border border-emerald-500/30">
                ✓
              </div>
              <h3 className="text-lg font-bold text-white">Talebiniz Başarıyla Alındı!</h3>
              <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
                Mesajınız destek birimimize iletilmiştir. Yetkili ekibimiz en geç 15 dakika içerisinde belirttiğiniz iletişim kanalı üzerinden sizinle iletişime geçecektir.
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="mt-2 text-xs font-semibold px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white transition cursor-pointer"
              >
                Yeni Talep Gönder
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
                  E-Posta Adresiniz
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Geri dönüş yapılacak e-posta adresiniz"
                  className="w-full bg-neutral-950/80 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-600 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
                  Konu Başlığı
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Örn: Lisans Teslimatı / Teknik Soru"
                  className="w-full bg-neutral-950/80 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-600 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
                  Sipariş Numarası <span className="text-neutral-500 lowercase">(varsa)</span>
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Örn: DEXX-8291"
                  className="w-full bg-neutral-950/80 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-600 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
                  Mesajınız
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Yaşadığınız durumu veya sorunuzu detaylı bir şekilde açıklayınız..."
                  className="w-full bg-neutral-950/80 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-600 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition cursor-pointer shadow-lg shadow-red-950 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isLoading ? 'Gönderiliyor...' : 'Destek Talebini Gönder'}</span>
                <span>→</span>
              </button>
            </form>
          )}

          <p className="text-center text-[11px] text-neutral-500 mt-4">
            🔒 Tüm biletler uçtan uca şifrelenir ve destek ekibimize güvenli olarak aktarılır.
          </p>
        </div>
      </div>
    </div>
  );
}