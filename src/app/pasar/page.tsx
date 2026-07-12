import type { Metadata } from 'next';
import { CatalogBinding } from '../../views/bindings/CatalogBinding';

export const metadata: Metadata = {
  title: 'Pasar',
  description:
    'Jelajahi motor baru & bekas, sparepart, dan aksesoris dari seller terkurasi PasarMotor.',
};

// Old links used app-internal ids; the URL now carries the API category slug.
const LEGACY_SLUGS: Record<string, string> = {
  sparepart: 'spare-part-motor',
  aksesoris: 'aksesoris-motor',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; q?: string }>;
}) {
  const { kategori, q } = await searchParams;
  const category = kategori ? (LEGACY_SLUGS[kategori] ?? kategori) : null;

  return <CatalogBinding initialCategory={category} initialQuery={q ?? ''} />;
}
