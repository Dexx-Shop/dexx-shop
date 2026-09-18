'use client';

import { useEffect, useState } from 'react';

export default function LanguageToggle() {
  const [lang, setLang] = useState<'TR' | 'EN'>('TR');

  useEffect(() => {
    // Sayfa açıldığında daha önce seçilen dili kontrol et
    const match = document.cookie.match(/googtrans=\/tr\/(en|tr)/);
    if (match && match[1] === 'en') {
      setLang('EN');
    }

    // Google Translate scriptini sayfaya ekle
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);

      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'tr',
            includedLanguages: 'en,tr',
            autoDisplay: false,
          },
          'google_translate_element'
        );
      };
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'TR' ? 'EN' : 'TR';
    setLang(nextLang);

    // Çeviri çerezini ayarla
    const targetCode = nextLang === 'EN' ? '/tr/en' : '/tr/tr';
    document.cookie = `googtrans=${targetCode}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=${targetCode}; path=/;`;

    // Sayfayı anlık çevir
    window.location.reload();
  };

  return (
    <>
      <div id="google_translate_element" className="hidden" />
      <button
        type="button"
        onClick={toggleLanguage}
        title={lang === 'TR' ? 'Switch to English' : "Türkçe'ye Geç"}
        className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-white/[0.04] hover:bg-red-950/40 border border-white/[0.06] hover:border-red-900/50 text-neutral-300 hover:text-red-400 transition text-[11px] font-bold tracking-wider select-none cursor-pointer"
      >
        <span>🌐</span>
        <span className={lang === 'EN' ? 'text-red-500' : 'text-white'}>{lang}</span>
      </button>
    </>
  );
}