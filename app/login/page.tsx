'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { loginAction } from '../auth/actions';

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (!result.success) {
      setErrorMessage(result.error || 'Giriş yapılamadı. Lütfen tekrar deneyiniz.');
      setIsLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-neutral-900/80 border border-neutral-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        
        {/* LOGO */}
        <div className="flex justify-center mb-4">
          <img
            src="/logo.png"
            alt="DexX Shop Logo"
            className="w-16 h-16 object-contain filter drop-shadow-[0_0_15px_rgba(239,68,68,0.45)] hover:scale-105 transition-transform"
          />
        </div>

        <h1 className="text-2xl font-black text-white text-center mb-1 tracking-tight">Giriş Yap</h1>
        <p className="text-xs text-neutral-400 text-center mb-6">
          Hesabınıza erişmek için bilgilerinizi girin
        </p>

        {errorMessage && (
          <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs p-3.5 rounded-xl mb-5 flex items-center gap-2">
            <span>⚠️</span>
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
              Gmail Adresi
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="ornek@gmail.com"
              className="w-full bg-neutral-950/80 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-600 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                Şifre
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-red-500 hover:text-red-400 transition"
              >
                Şifremi Unuttum?
              </Link>
            </div>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-neutral-950/80 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-600 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 rounded-xl transition cursor-pointer disabled:opacity-50 shadow-lg shadow-red-950"
          >
            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-400 mt-6">
          Henüz hesabın yok mu?{' '}
          <Link href="/register" className="text-red-500 font-semibold hover:text-red-400 ml-1">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}