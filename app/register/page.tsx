'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { registerAction, verifyCodeAction } from '../auth/actions';

export default function RegisterPage() {
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [emailForVerification, setEmailForVerification] = useState('');
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleRegisterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const result = await registerAction(formData);

    if (!result.success) {
      setErrorMessage(result.error || 'Kayıt başlatılamadı.');
      setIsLoading(false);
    } else {
      setEmailForVerification(email);
      setStep('verify');
      setIsLoading(false);
    }
  }

  async function handleVerifySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const result = await verifyCodeAction(emailForVerification, code);

    if (!result.success) {
      setErrorMessage(result.error || 'Kod doğrulanamadı.');
      setIsLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-neutral-900/80 border border-neutral-800 rounded-3xl p-7 sm:p-8 shadow-2xl backdrop-blur-xl">
        
        {/* LOGO */}
        <div className="flex justify-center mb-3">
          <img
            src="/logo.png"
            alt="DexX Shop Logo"
            className="w-14 h-14 object-contain filter drop-shadow-[0_0_15px_rgba(239,68,68,0.45)] hover:scale-105 transition-transform"
          />
        </div>

        {step === 'form' ? (
          <>
            <h1 className="text-2xl font-black text-white text-center mb-1 tracking-tight">Hesap Oluştur</h1>
            <p className="text-xs text-neutral-400 text-center mb-5">
              DexX Shop ayrıcalıklarından yararlanmak için kayıt olun
            </p>

            {errorMessage && (
              <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs p-3 rounded-xl mb-4 text-center">
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1 font-semibold">Ad Soyad</label>
                <input
                  name="fullName"
                  required
                  placeholder="Adınız Soyadınız"
                  className="w-full bg-neutral-950/80 border border-neutral-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1 font-semibold">Kullanıcı Adı</label>
                <input
                  name="username"
                  required
                  placeholder="kullaniciadi"
                  className="w-full bg-neutral-950/80 border border-neutral-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1 font-semibold">Gmail Adresi</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="ornek@gmail.com"
                  className="w-full bg-neutral-950/80 border border-neutral-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1 font-semibold">Şifre (En az 6 karakter)</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-neutral-950/80 border border-neutral-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
                  Referans Kodu <span className="text-neutral-500 lowercase">(isteğe bağlı)</span>
                </label>
                <input
                  name="refCode"
                  placeholder="Varsa referans kodunuz"
                  className="w-full bg-neutral-950/80 border border-neutral-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50 shadow-lg shadow-red-950"
              >
                <span>{isLoading ? 'Kod Gönderiliyor...' : 'Kayıt Ol'}</span>
                <span>→</span>
              </button>
            </form>

            <p className="text-[11px] text-neutral-400 text-center mt-3 leading-relaxed">
              Kayıt olarak{' '}
              <Link href="/terms" target="_blank" className="text-red-500 hover:text-red-400 font-medium underline underline-offset-2">
                Kullanım Koşulları
              </Link>
              'nı ve{' '}
              <Link href="/privacy" target="_blank" className="text-red-500 hover:text-red-400 font-medium underline underline-offset-2">
                Gizlilik Politikası
              </Link>
              'nı kabul etmiş olursunuz.
            </p>

            <p className="text-center text-xs text-neutral-400 mt-5">
              Zaten üye misiniz?{' '}
              <Link href="/login" className="text-red-500 hover:text-red-400 font-semibold ml-1">
                Giriş Yap
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-black text-white text-center mb-1">E-postayı Doğrula</h1>
            <p className="text-xs text-neutral-400 text-center mb-6">
              <span className="text-white font-medium">{emailForVerification}</span> adresine 6 haneli kod gönderildi.
            </p>

            {errorMessage && (
              <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs p-3 rounded-xl mb-4 text-center">
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-2 text-center font-semibold">
                  6 Haneli Kod
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-center tracking-[10px] text-2xl font-mono text-red-500 focus:outline-none focus:border-red-600"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || code.length < 6}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition cursor-pointer disabled:opacity-50 shadow-lg shadow-red-950"
              >
                {isLoading ? 'Doğrulanıyor...' : 'Onayla ve Giriş Yap'}
              </button>

              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full text-center text-xs text-neutral-400 hover:text-white mt-2 block"
              >
                ← Bilgileri Değiştir
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}