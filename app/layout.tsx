import CartDrawer from 'components/cart/CartDrawer';
import ConditionalLayout from 'components/layout/ConditionalLayout';
import { Footer } from 'components/layout/footer';
import { Navbar } from 'components/layout/navbar';
import { CartProvider } from 'lib/cart';
import { Plus_Jakarta_Sans } from "next/font/google";
import './globals.css';

export const metadata = {
  title: 'DexX Shop',
  description: 'VIP Yazılım & Lisans Çözümleri'
};

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`dark ${jakarta.variable}`}>
      <body className="bg-black text-white min-h-screen antialiased selection:bg-red-600 selection:text-white font-[family-name:var(--font-jakarta)]">
        <CartProvider>
          <CartDrawer />
          <ConditionalLayout
            navbar={<Navbar />}
            footer={<Footer />}
          >
            {children}
          </ConditionalLayout>
        </CartProvider>
      </body>
    </html>
  );
}