'use client';

import Link from 'next/link';
import { useState } from 'react';
import { forgotPasswordAction } from '../auth/actions';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await forgotPasswordAction(formData);

    if (!result.success) {
      setErrorMessage(result.error || 'İşlem gerçekleştirilemedi.');
      setIsLoading(false);
    } else {
      setSent(true);
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white text-center mb-1">Şifremi Unuttum</h1>
        <p className="text-xs text-neutral-400 text-center mb-6">
          Hesabınıza ait Gmail adresinizi girin, sıfırlama bağlantısı gönderelim
        </p>

        {errorMessage && (
          <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs p-3.5 rounded-lg mb-5 text-center">
            ⚠️ {errorMessage}
          </div>
        )}

        {sent ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl border border-red-600/40">
              ✉️
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Bağlantı Gönderildi!</h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-6">
              Şifre sıfırlama bağlantınız e-posta adresinize gönderildi. Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.
            </p>
            <Link
              href="/login"
              className="inline-block bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-4 py-2.5 rounded-lg transition"
            >
              Giriş Ekranına Dön
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">
                Kayıtlı Gmail Adresi
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="adiniz@gmail.com"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-red-600 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-xs text-neutral-400 hover:text-white transition">
                ← Giriş Ekranına Geri Dön
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}