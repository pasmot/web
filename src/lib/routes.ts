import type { AppView } from '../types/app';

/** Canonical URL paths for each high-level view. */
export const VIEW_PATHS = {
  landing: '/',
  catalog: '/pasar',
  chat: '/montir-ai',
  saved: '/incaran',
  profile: '/profil',
  inspeksi: '/inspeksi',
} as const;

/** Halaman informasi (bantuan, kontak, dokumen resmi) — di luar navigasi utama. */
export const INFO_PATHS = [
  '/bantuan',
  '/hubungi-kami',
  '/kebijakan-privasi',
  '/syarat-ketentuan',
  '/registrasi-seller',
] as const;

export function productPath(id: string): string {
  return `/produk/${id}`;
}

export function dealerPath(id: string): string {
  return `/dealer/${id}`;
}

/** Build the catalog URL with optional category/query params. */
export function catalogPath(category?: string | null, query?: string): string {
  const params = new URLSearchParams();
  if (category) params.set('kategori', category);
  if (query) params.set('q', query);
  const qs = params.toString();
  return qs ? `${VIEW_PATHS.catalog}?${qs}` : VIEW_PATHS.catalog;
}

/** Map the current pathname back to a high-level view (for nav highlighting). */
export function viewFromPathname(pathname: string): AppView {
  if (pathname === '/' ) return 'landing';
  if (pathname.startsWith('/pasar')) return 'catalog';
  if (pathname.startsWith('/produk')) return 'product-detail';
  if (pathname.startsWith('/dealer')) return 'dealer';
  if (pathname.startsWith('/montir-ai')) return 'chat';
  if (pathname.startsWith('/incaran')) return 'saved';
  if (pathname.startsWith('/profil')) return 'profile';
  if (pathname.startsWith('/inspeksi')) return 'inspeksi';
  if (INFO_PATHS.some((path) => pathname.startsWith(path))) return 'info';
  return 'landing';
}
