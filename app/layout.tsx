import CartDrawer from 'components/cart/CartDrawer';
import ConditionalLayout from 'components/layout/ConditionalLayout';
import { Footer } from 'components/layout/footer';
import { Navbar } from 'components/layout/navbar';
import { CartProvider } from 'lib/cart';
import { Plus_Jakarta_Sans } from "next/font/google";
import './globals.css';

export const metadata = {
  title: 'DexX Shop',
  description: 'Cheats & Spoofers',
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon.png', sizes: '64x64', type: 'image/png' },
    ],
    shortcut: '/icon.png',
    apple: [
      { url: '/icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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