import { getProducts } from 'lib/products';
import { notFound } from 'next/navigation';
import ProductClientView from './ProductClientView';

export const dynamic = 'force-dynamic';

export default async function ProductPage({
  params
}: {
  params: Promise<{ handle: string }>;
}) {
  // Klasör adı [handle] olduğu için parametreyi 'handle' olarak karşılıyoruz:
  const resolvedParams = await params;
  const targetId = resolvedParams.handle;

  const products = await getProducts();

  // ID veya varsa handle alanı ile eşleştiriyoruz
  const product = products.find((p: any) => 
    String(p.id) === String(targetId) || String(p.handle) === String(targetId)
  );

  if (!product) {
    notFound();
  }

  return <ProductClientView product={product} />;
}