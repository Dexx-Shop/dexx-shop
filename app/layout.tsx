import CartDrawer from 'components/cart/CartDrawer';
import ConditionalLayout from 'components/layout/ConditionalLayout';
import { Footer } from 'components/layout/footer';
import { Navbar } from 'components/layout/navbar';
import { CartProvider } from 'lib/cart';
import './globals.css';

export const metadata = {
  title: 'DexX Shop',
  description: 'VIP Yazılım & Lisans Çözümleri'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body className="bg-[#080809] text-white min-h-screen antialiased selection:bg-white selection:text-black">
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