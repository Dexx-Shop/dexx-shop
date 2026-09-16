import { getProducts } from 'lib/products';
import StatusView from './StatusView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StatusPage() {
  const products = await getProducts();
  return <StatusView initialProducts={products} />;
}