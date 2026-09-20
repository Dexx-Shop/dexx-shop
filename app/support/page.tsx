import { getCurrentUser } from 'lib/auth';
import { getUserTicketsAction } from 'lib/tickets';
import Link from 'next/link';
import SupportClientInterface from './SupportClientInterface';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SupportPage() {
  const user = await getCurrentUser();
  const initialTickets = user ? await getUserTicketsAction() : [];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white pb-24 px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Üst Tanıtım Başlığı */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/50 border border-red-500/30 text-red-400 text-xs font-bold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CANLI YARDIM MASASI</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Size Nasıl Yardımcı Olabiliriz?
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            E-posta beklemeye son. Lisans teslimatı, teknik sorular ve kurulum için anında canlı destek talebi oluşturun.
          </p>
        </div>

        {/* Kullanıcı Giriş Yapmamışsa */}
        {!user ? (
          <div className="text-center py-16 bg-[#0c0c10] border border-neutral-800 rounded-3xl p-8 backdrop-blur-md max-w-xl mx-auto space-y-4 shadow-2xl">
            <span className="text-4xl block">🔒</span>
            <h3 className="text-lg font-bold text-white">Giriş Yapmanız Gerekiyor</h3>
            <p className="text-xs text-neutral-400">
              Canlı destek talebi açmak ve yetkililerimizle mesajlaşabilmek için lütfen hesabınıza giriş yapın.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-block px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-red-950 cursor-pointer"
              >
                Giriş Yap →
              </Link>
            </div>
          </div>
        ) : (
          /* Oturum Doğrulandı: İstemci Arayüzü */
          <SupportClientInterface
            user={user}
            initialTickets={initialTickets}
          />
        )}

      </div>
    </div>
  );
}