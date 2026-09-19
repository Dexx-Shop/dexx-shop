'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import {
  activateLicenseAction,
  changePasswordAction,
  deleteLicenseAction,
  logoutAction,
  redeemCouponAction
} from './actions';

interface ProfileClientProps {
  user: {
    id: string;
    username: string;
    email: string;
    balance: string;
  };
  licenses: any[];
  orders: any[];
}

export default function ProfileClientView({ user, licenses: initialLicenses }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<'licenses' | 'wallet' | 'seller' | 'settings'>('wallet');
  const [currentBalance, setCurrentBalance] = useState(user.balance);
  const [licenseList, setLicenseList] = useState<any[]>(initialLicenses || []);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [surveyChoice, setSurveyChoice] = useState('YouTube Videoları');

  // Silme Onay Modalı
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; key: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lisans Anahtarı Aktifleştirme
  const [keyInput, setKeyInput] = useState('');
  const [keyMsg, setKeyMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [isActivatingKey, setIsActivatingKey] = useState(false);

  // Kupon Modalı
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [redeemMsg, setRedeemMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Şifre Formu
  const [pwMsg, setPwMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Yönlendirme Bağlantıları
  const DISCORD_URL = 'https://discord.gg/P4hymgPn3R';
  const ITEMSATIS_URL = 'https://www.itemsatis.com'; // Buraya kendi İtemSatış mağaza linkini yapıştırabilirsin

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleActivateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActivatingKey(true);
    setKeyMsg(null);

    const res = await activateLicenseAction(keyInput);
    setIsActivatingKey(false);

    if (res.error) {
      setKeyMsg({ text: res.error, error: true });
    } else if (res.success && res.license) {
      setKeyMsg({ text: res.message || 'Lisans tanımlandı!', error: false });
      setLicenseList((prev) => [res.license, ...prev]);
      setKeyInput('');
      setTimeout(() => setKeyMsg(null), 3000);
    }
  };

  const confirmDeleteLicense = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    const res = await deleteLicenseAction(deleteTarget.id, deleteTarget.key);
    setIsDeleting(false);

    if (res.success) {
      setLicenseList((prev) => prev.filter((item) => item.key !== deleteTarget.key));
      setDeleteTarget(null);
    } else {
      alert(res.error || 'Silme işlemi başarısız oldu.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPwMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await changePasswordAction(formData);

    setIsSubmitting(false);
    if (res.error) {
      setPwMsg({ text: res.error, error: true });
    } else if (res.success) {
      setPwMsg({ text: res.message || 'Şifre başarıyla güncellendi.', error: false });
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRedeeming(true);
    setRedeemMsg(null);

    const res = await redeemCouponAction(couponCodeInput);
    setIsRedeeming(false);

    if (res.error) {
      setRedeemMsg({ text: res.error, error: true });
    } else if (res.success) {
      setRedeemMsg({ text: res.message || 'Başarılı', error: false });
      if (res.newBalance) {
        setCurrentBalance(res.newBalance);
      }
      setCouponCodeInput('');
      setTimeout(() => {
        setIsRedeemOpen(false);
        setRedeemMsg(null);
      }, 1600);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] flex font-[family-name:var(--font-jakarta)] antialiased selection:bg-red-600 selection:text-white">
      
      {/* SOL MENÜ */}
      <aside className="w-64 border-r border-white/[0.05] bg-[#070709] flex flex-col justify-between p-4 shrink-0 select-none">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 py-3 border-b border-white/[0.05]">
            <div className="w-10 h-10 rounded-full bg-[#1c0d0d] border border-red-800/40 flex items-center justify-center font-bold text-red-500 text-sm tracking-tight">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-white truncate tracking-tight">{user.username}</h2>
              <p className="text-[11px] text-neutral-400 truncate font-normal">{user.email}</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('licenses')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition cursor-pointer ${
                activeTab === 'licenses'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span>Lisanslarım</span>
            </button>

            <button
              onClick={() => setActiveTab('wallet')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition cursor-pointer ${
                activeTab === 'wallet'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Cüzdan</span>
            </button>

            <button
              onClick={() => setActiveTab('seller')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition cursor-pointer ${
                activeTab === 'seller'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Satıcı Paneli</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Ayarlar</span>
            </button>
          </nav>
        </div>

        {/* ALT LİNKLER */}
        <div className="pt-4 border-t border-white/[0.05] space-y-1">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-neutral-400 hover:text-white hover:bg-white/[0.04] transition"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Ana Sayfa</span>
          </Link>

          <form action={logoutAction} className="w-full">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-rose-500 hover:text-rose-400 hover:bg-rose-950/20 transition cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Çıkış Yap</span>
            </button>
          </form>
        </div>
      </aside>

      {/* SAĞ İÇERİK ALANI */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* 1. LİSANSLARIM */}
          {activeTab === 'licenses' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Lisans Anahtarlarım</h1>
                <p className="text-sm text-neutral-400 mt-1">Satın aldığınız lisans anahtarları burada listelenecek.</p>
              </div>

              {/* Lisans Tanımlama */}
              <div className="bg-[#0b0b0e] border border-white/[0.07] rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-sm">
                    🔐
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-tight">Lisans Anahtarı Tanımla</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Satın alım sonrası aldığınız lisans kodunu girerek üyeliğinizi başlatın.
                    </p>
                  </div>
                </div>

                {keyMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium border ${
                      keyMsg.error
                        ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                        : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    }`}
                  >
                    {keyMsg.text}
                  </div>
                )}

                <form onSubmit={handleActivateLicense} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="DEXX-XXXX-XXXX-XXXX"
                    required
                    className="flex-1 px-4 py-2.5 text-xs font-mono rounded-xl bg-black/70 border border-white/[0.1] text-white uppercase placeholder:text-neutral-600 focus:outline-none focus:border-white/40 tracking-wider transition"
                  />
                  <button
                    type="submit"
                    disabled={isActivatingKey}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-tight transition cursor-pointer disabled:opacity-50 shrink-0 shadow-lg shadow-red-950/40"
                  >
                    {isActivatingKey ? 'Tanımlanıyor...' : 'LİSANSI AKTİF ET'}
                  </button>
                </form>
              </div>

              {/* Lisans Listesi */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                    <span>🔑</span>
                    <span>Lisanslarım & Mod Erişimlerim</span>
                  </h3>
                  <span className="text-xs font-mono text-neutral-400">
                    {licenseList.length} Aktif Ürün
                  </span>
                </div>

                {licenseList.length === 0 ? (
                  <div className="bg-[#0b0b0e] border border-white/[0.05] rounded-2xl p-12 text-center text-sm text-neutral-500">
                    Henüz satın alınmış veya aktifleştirilmiş bir lisans anahtarınız bulunmuyor.
                  </div>
                ) : (
                  licenseList.map((lic: any, idx: number) => (
                    <div key={lic.id || lic.key || idx} className="bg-[#0b0b0e] border border-white/[0.05] rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-white/[0.08] overflow-hidden shrink-0 flex items-center justify-center">
                            {lic.image ? (
                              <img
                                src={lic.image}
                                alt={lic.productTitle}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[10px] font-mono text-neutral-500 font-bold">
                                {lic.game || 'DEXX'}
                              </span>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-white tracking-tight">
                                {lic.productTitle || 'DexX External Cheat'}
                              </h4>
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {lic.status === 'expired' ? 'Süresi Doldu' : 'Aktif Üyelik'}
                              </span>
                            </div>
                            <span className="text-xs text-neutral-400 mt-0.5 inline-block">
                              Paket: {lic.tier || 'Günlük'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                id: lic.id || '',
                                key: lic.key,
                                title: lic.productTitle || 'DexX Lisansı'
                              })
                            }
                            className="px-3 py-1.5 rounded-xl border border-rose-900/40 bg-rose-950/20 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-900/40 transition cursor-pointer flex items-center gap-1"
                          >
                            Sil
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/60 border border-white/[0.05]">
                        <span className="text-xs font-mono text-neutral-300 truncate select-all">{lic.key}</span>
                        <button
                          onClick={() => copyToClipboard(lic.key, `key-${idx}`)}
                          className="text-xs text-neutral-400 hover:text-white transition cursor-pointer shrink-0 ml-3"
                        >
                          {copiedId === `key-${idx}` ? 'Kopyalandı ✓' : 'Kopyala'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 2. CÜZDAN */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">Cüzdanım</h1>
                <p className="text-sm text-neutral-400 mt-1">Bakiyenizi yönetin ve ödeme yöntemlerini görüntüleyin.</p>
              </div>

              {/* Bakiye Kutusu */}
              <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#120808] via-[#09090b] to-[#0a0a0f] p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl">
                <div>
                  <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Toplam Bakiye</span>
                  <div className="text-4xl sm:text-6xl font-black text-white tracking-tight mt-2 flex items-baseline gap-1.5">
                    <span>{Number(currentBalance).toFixed(2)}</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-red-500">$</span>
                  </div>
                  
                  {/* CANLI VE ŞIK BUTONLAR */}
                  <div className="flex flex-wrap items-center gap-3.5 mt-8">
                    <a
                      href="https://dexx-shop.mysellauth.com/products"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-[#ce1818] hover:from-red-500 hover:to-red-600 text-white text-xs font-extrabold tracking-wide uppercase transition-all duration-300 shadow-[0_0_25px_rgba(206,24,24,0.4)] hover:shadow-[0_0_35px_rgba(206,24,24,0.6)] hover:scale-[1.02] flex items-center gap-2 cursor-pointer no-underline"
                    >
                      <span className="text-sm leading-none">+</span>
                      <span>Bakiye Yükle</span>
                    </a>

                    <button
                      onClick={() => setIsRedeemOpen(true)}
                      className="px-5 py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] hover:border-white/30 text-xs font-bold text-white tracking-tight transition-all duration-200 flex items-center gap-2.5 cursor-pointer backdrop-blur-md hover:scale-[1.02]"
                    >
                      <svg className="w-4 h-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      <span>Bakiye Kodu Bozdur</span>
                    </button>
                  </div>
                </div>

                <div className="hidden sm:flex w-28 h-28 rounded-3xl bg-red-950/20 border border-red-900/30 items-center justify-center shadow-inner">
                  <svg className="w-14 h-14 text-red-500/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>

              {/* 3'LÜ YENİ ÖDEME KARTLARI GRİDİ */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                
                {/* 1. KART: KREDİ KARTI / KRİPTO (SELLAUTH) */}
                <a
                  href="https://dexx-shop.mysellauth.com/products"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative bg-[#0c0c0f] border border-white/[0.08] hover:border-red-600/60 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer h-44 group hover:shadow-[0_0_30px_rgba(206,24,24,0.2)] hover:-translate-y-1 no-underline"
                >
                  <span className="absolute top-3.5 right-3.5 text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                    AKTİF
                  </span>
                  <div className="w-12 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:border-red-500/50 transition-all">
                    <div className="w-3.5 h-2.5 rounded-[2px] bg-red-600" />
                  </div>
                  <h4 className="text-sm font-extrabold text-white tracking-tight">Kredi Kartı / Global Ödeme</h4>
                  <p className="text-xs text-neutral-400 font-medium mt-1">SellAuth üzerinden</p>
                  <span className="text-[11px] font-bold text-red-500 flex items-center gap-1 mt-1.5">
                    <span>⚡ Otomatik Yükleme</span>
                  </span>
                </a>

                {/* 2. KART: IBAN (DİSCORD TİCKET) */}
                <a
                  href={DISCORD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative bg-[#0c0c0f] border border-white/[0.08] hover:border-white/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer h-44 group hover:shadow-[0_0_25px_rgba(255,255,255,0.06)] hover:-translate-y-1 no-underline"
                >
                  <div className="w-12 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-all">
                    <div className="w-4 h-3 border-t-2 border-emerald-500 bg-neutral-800 rounded-sm" />
                  </div>
                  <h4 className="text-sm font-extrabold text-white tracking-tight">IBAN</h4>
                  <p className="text-xs text-neutral-400 font-medium mt-1">Türk kullanıcılar içindir.</p>
                  <span className="text-[11px] font-bold text-neutral-400 group-hover:text-emerald-400 flex items-center gap-1 mt-1.5 transition-colors">
                    <span>↗ Discord ticket üzerinden</span>
                  </span>
                </a>

                {/* 3. KART: İTEMSATIŞ */}
                {/* 3. İtemSatış (Doğrudan DexX Shop Profili) */}
                <a
                  href="https://www.itemsatis.com/profil/dexxshop.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative bg-[#0c0c0f] border border-white/[0.08] hover:border-amber-500/50 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer h-44 group hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:-translate-y-1 no-underline"
                >
                  <div className="w-12 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:border-amber-500/50 transition-all">
                    <span className="text-amber-400 font-black text-xs tracking-tighter">İS</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white tracking-tight">İtemSatış</h4>
                  <p className="text-xs text-neutral-400 font-medium mt-1">Tüm ödeme seçenekleri</p>
                  <span className="text-[11px] font-bold text-amber-500/90 flex items-center gap-1 mt-1.5">
                    <span>↗ İtemSatış üzerinden</span>
                  </span>
                </a>

              </div>

              {/* GÜVENLİK BİLGİLENDİRMESİ */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-[#0b0b0e] border border-white/[0.05] flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
                    ✓
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold text-white">Güvenli Ödeme</h5>
                    <p className="text-[11px] text-neutral-400 leading-relaxed font-normal">
                      Ödemeleriniz 256-bit SSL ile korunur. Kart bilgileriniz saklanmaz.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0b0b0e] border border-white/[0.05] flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-red-950/80 border border-red-800 flex items-center justify-center text-red-400 shrink-0">
                    ⚡
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold text-white">Anında Teslimat</h5>
                    <p className="text-[11px] text-neutral-400 leading-relaxed font-normal">
                      Bakiye anında tanımlanır ve alışverişe hemen başlayabilirsiniz.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0b0b0e] border border-white/[0.05] flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                    $
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold text-white">Dolar Bakiye Sistemi</h5>
                    <p className="text-[11px] text-neutral-400 leading-relaxed font-normal">
                      Tüm ürün ve cüzdan bakiyeleriniz USD ($) bazlı hesaplanmaktadır.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 3. SATICI PANELİ */}
          {activeTab === 'seller' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Satıcı Hesabı</h1>
                <p className="text-sm text-neutral-400 mt-1">Ürünlerinizi DexX pazarında satmak için yetkilendirme alın.</p>
              </div>

              <div className="bg-[#0b0b0e] border border-white/[0.05] rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-lg">
                  🏪
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Satıcı Hesabı Aktif Değil</h3>
                  <p className="text-xs text-neutral-400 max-w-sm mt-1 leading-relaxed">
                    Satıcı panelini kullanmak için Satıcı Lisansı satın almanız gerekmektedir.
                  </p>
                </div>
                <button className="px-6 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-semibold tracking-tight transition cursor-pointer">
                  Satıcı Ol ($199.99)
                </button>
              </div>
            </div>
          )}

          {/* 4. AYARLAR */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Ayarlar</h1>
                <p className="text-sm text-neutral-400 mt-1">Hesap güvenliğinizi ve tercihlerinizi yapılandırın.</p>
              </div>

              {/* Şifre Değiştir */}
              <div className="bg-[#0b0b0e] border border-white/[0.05] rounded-2xl p-6 max-w-xl space-y-4">
                <h3 className="text-sm font-semibold text-white">Şifre Değiştir</h3>
                
                {pwMsg && (
                  <div className={`p-3 rounded-xl text-xs font-medium border ${
                    pwMsg.error
                      ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                      : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  }`}>
                    {pwMsg.text}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Mevcut Şifre</label>
                    <input
                      name="currentPassword"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-white/30 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Yeni Şifre</label>
                    <input
                      name="newPassword"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-white/30 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Yeni Şifre (Tekrar)</label>
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-white/30 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold tracking-tight transition mt-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                  </button>
                </form>
              </div>

              {/* Anket */}
              <div className="bg-[#0b0b0e] border border-white/[0.05] rounded-2xl p-6 max-w-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Bizi Nereden Gördünüz?</h3>
                  <span className="text-[10px] text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    Kaydedildi
                  </span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                  Bizi nereden duyduğunuzu seçerek platformumuzu geliştirmemize yardımcı olun.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {[
                    'YouTube Videoları',
                    'Arama Motoru (Google, Yandex, Bing)',
                    'TikTok / Instagram Videoları',
                    'Discord',
                    'Arkadaş Tavsiyesi',
                    'Elitepvpers',
                    'CheatGlobal'
                  ].map((label) => (
                    <button
                      key={label}
                      onClick={() => setSurveyChoice(label)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs text-left transition cursor-pointer ${
                        surveyChoice === label
                          ? 'border-emerald-500/40 bg-emerald-500/5 text-white font-medium'
                          : 'border-white/[0.06] bg-black/40 text-neutral-400 hover:text-white hover:border-white/[0.12]'
                      }`}
                    >
                      <span className="truncate">{label}</span>
                      {surveyChoice === label && <span className="text-emerald-400 ml-1">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* SİLME ONAY MODALI */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0e0e11] border border-red-900/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-950/60 border border-rose-800/80 flex items-center justify-center text-rose-400 text-lg">
                ⚠️
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">Aktif Ürünü Sil</h3>
                <p className="text-xs text-neutral-400 mt-0.5 truncate max-w-[280px]">
                  {deleteTarget.title}
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed font-normal bg-black/40 p-3 rounded-xl border border-white/[0.05]">
              Bu aktif ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-neutral-300 hover:text-white text-xs font-medium transition cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={confirmDeleteLicense}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold tracking-tight transition cursor-pointer disabled:opacity-50 shadow-lg shadow-rose-950/40"
              >
                {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BAKİYE KODU BOZDUR MODALI */}
      {isRedeemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0b0b0e] border border-white/[0.1] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white tracking-tight">Bakiye Kodu Bozdur</h3>
              <button
                onClick={() => {
                  setIsRedeemOpen(false);
                  setRedeemMsg(null);
                }}
                className="text-neutral-500 hover:text-white text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed font-normal">
              İtemSatış üzerinden veya yöneticilerden aldığınız bakiye kupon kodunu girerek cüzdanınıza anında yükleme yapabilirsiniz.
            </p>

            {redeemMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-medium border ${
                  redeemMsg.error
                    ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                    : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                }`}
              >
                {redeemMsg.text}
              </div>
            )}

            <form onSubmit={handleRedeem} className="space-y-3">
              <input
                type="text"
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value)}
                placeholder="DEXX-XXXX-XXXX-XXXX"
                required
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-black/70 border border-white/[0.1] text-white uppercase placeholder:text-neutral-600 focus:outline-none focus:border-white/40 tracking-wider transition"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRedeemOpen(false);
                    setRedeemMsg(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white text-xs font-medium transition cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isRedeeming}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-tight transition cursor-pointer disabled:opacity-50 shadow-lg shadow-red-950/50"
                >
                  {isRedeeming ? 'Kontrol Ediliyor...' : 'Kodu Tanımla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}