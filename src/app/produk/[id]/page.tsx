import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Product } from '../../../types/product';
import { getProduct, products } from '../../../data/products';
import { fetchListing } from '../../../lib/api';
import { ProductBinding } from '../../../views/bindings/ProductBinding';

type Params = { id: string };

// Mock products are pre-rendered; live API listings are rendered on demand.
export function generateStaticParams(): Params[] {
  return products.map((p) => ({ id: p.id }));
}

// Resolve a product by id: prefer the curated mock data, then fall back to the
// live public catalog. cache() dedupes the lookup across metadata + page render.
const resolveProduct = cache(async (id: string): Promise<Product | null> => {
  const mock = getProduct(id);
  if (mock) return mock;
  try {
    return await fetchListing(id, { next: { revalidate: 300 } });
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await resolveProduct(id);
  if (!product) return { title: 'Produk tidak ditemukan' };
  return {
    title: `${product.title} — ${product.price}`,
    description: [
      `${product.title} di ${product.location}.`,
      [product.year, product.mileage].filter(Boolean).join(' · '),
      'Cek lewat Montir AI atau ajukan inspeksi sebelum transaksi.',
    ]
      .filter(Boolean)
      .join(' '),
    openGraph: {
      title: product.title,
      images: product.image ? [product.image] : [],
    },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const product = await resolveProduct(id);
  if (!product) notFound();
  return <ProductBinding product={product} />;
}
