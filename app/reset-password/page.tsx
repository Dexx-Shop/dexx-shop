'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { resetPasswordAction } from '../auth/actions';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append('token', token);

    const result = await resetPasswordAction(formData);

    if (!result.success) {
      setErrorMessage(result.error || 'Şifre güncellenemedi.');
      setIsLoading(false);
    } else {
      setSuccess(true);
      setIsLoading(false);
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    }
  }

  if (!token) {
    return (
      <div className="text-center py-6">
        <p className="text-red-400 text-sm mb-4">Geçersiz veya eksik sıfırlama bağlantısı.</p>
        <Link href="/login" className="text-xs text-neutral-400 hover:text-white underline">
          Giriş Sayfasına Dön
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white text-center mb-1">Yeni Şifre Belirle</h1>
      <p className="text-xs text-neutral-400 text-center mb-6">
        Lütfen hesabınız için yeni bir şifre girin
      </p>

      {errorMessage && (
        <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs p-3.5 rounded-lg mb-5 text-center">
          ⚠️ {errorMessage}
        </div>
      )}

      {success ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl border border-red-600/40">
            ✓
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Şifreniz Değiştirildi!</h3>
          <p className="text-xs text-neutral-400">Giriş sayfasına yönlendiriliyorsunuz...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">
              Yeni Şifre (En az 6 karakter)
            </label>
            <input
              name="newPassword"
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-red-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">
              Yeni Şifre Tekrar
            </label>
            <input
              name="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-red-600 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <Suspense fallback={<p className="text-center text-xs text-neutral-400">Yükleniyor...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}