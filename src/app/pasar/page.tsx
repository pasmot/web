import type { Metadata } from 'next';
import type { ProductCategory } from '../../types/product';
import { CatalogBinding } from '../../views/bindings/CatalogBinding';

export const metadata: Metadata = {
  title: 'Pasar',
  description:
    'Jelajahi motor baru & bekas, sparepart, dan aksesoris dari seller terkurasi PasarMotor.',
};

const VALID_CATEGORIES: ProductCategory[] = ['motor', 'sparepart', 'aksesoris'];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; q?: string }>;
}) {
  const { kategori, q } = await searchParams;
  const category =
    kategori && VALID_CATEGORIES.includes(kategori as ProductCategory)
      ? (kategori as ProductCategory)
      : null;

  return <CatalogBinding initialCategory={category} initialQuery={q ?? ''} />;
}
