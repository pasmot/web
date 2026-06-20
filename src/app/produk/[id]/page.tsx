import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct, products } from '../../../data/products';
import { ProductBinding } from '../../../views/bindings/ProductBinding';

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) return { title: 'Produk tidak ditemukan' };
  return {
    title: `${product.title} — ${product.price}`,
    description: `${product.title} di ${product.location}. ${product.year} · ${product.mileage}. Cek lewat Montir AI atau ajukan inspeksi sebelum transaksi.`,
    openGraph: {
      title: product.title,
      images: [product.image],
    },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();
  return <ProductBinding product={product} />;
}
