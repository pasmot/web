import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Product } from '../../../types/product';
import { getProduct, products } from '../../../data/products';
import { fetchListing } from '../../../lib/api';
import { listingImagePath } from '../../../lib/listingImage';
import { ProductBinding } from '../../../views/bindings/ProductBinding';

type Params = { id: string };

// Mock products are pre-rendered; live API listings are rendered on demand.
export function generateStaticParams(): Params[] {
  return products.map((p) => ({ id: p.id }));
}

/**
 * Points the gallery at /api/img instead of the API's own photo URLs.
 *
 * Those are presigned and expire after an hour, which this page's cached HTML
 * routinely outlives — the symptom being a gallery of "Gambar tidak tersedia"
 * placeholders until someone reloads. The indirection never expires, so the
 * HTML stays cacheable and each photo is signed when it is actually requested.
 */
function withStableImages(product: Product): Product {
  if (product.gallery.length === 0) return product;
  const gallery = product.gallery.map((_, i) => listingImagePath(product.id, i));
  return { ...product, image: gallery[0], gallery };
}

// Resolve a product by id: prefer the curated mock data, then fall back to the
// live public catalog. cache() dedupes the lookup across metadata + page render.
// Mock photos are ordinary static URLs, so only API listings need rewriting.
const resolveProduct = cache(async (id: string): Promise<Product | null> => {
  const mock = getProduct(id);
  if (mock) return mock;
  try {
    const listing = await fetchListing(id, { next: { revalidate: 300 } });
    return listing && withStableImages(listing);
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
