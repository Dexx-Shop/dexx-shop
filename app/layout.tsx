import CartDrawer from 'components/cart/CartDrawer';
import { Footer } from 'components/layout/footer';
import { Navbar } from 'components/layout/navbar';
import { CartProvider } from 'lib/cart';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap'
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap'
});

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`dark ${jakarta.variable} ${inter.variable}`}>
      <body className="bg-[#09090b] text-white font-sans antialiased min-h-screen flex flex-col justify-between selection:bg-red-600 selection:text-white">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main className="pt-28 sm:pt-36 min-h-[calc(100vh-140px)]">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}