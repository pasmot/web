import type { Category } from '../lib/api';

/**
 * Fallback while /api/v1/categories loads (or if it fails) so the UI never
 * renders without category chips/cards. Mirrors the API response shape.
 */
export const FALLBACK_CATEGORIES: Category[] = [
  { id: 1, name: 'Motor', slug: 'motor' },
  { id: 2, name: 'Spare Part Motor', slug: 'spare-part-motor' },
  { id: 3, name: 'Aksesoris Motor', slug: 'aksesoris-motor' },
];

/**
 * Local presentation for the landing-page category cards, keyed by API slug —
 * the API only provides id/name/slug.
 */
export const CATEGORY_META: Record<string, { description: string; image: string }> = {
  motor: {
    description: 'Motor baru & bekas terkurasi',
    image:
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80',
  },
  'spare-part-motor': {
    description: 'Part original & aftermarket',
    image: '/sparepart.png',
  },
  'aksesoris-motor': {
    description: 'Helm, jaket & gear riding',
    image:
      'https://images.unsplash.com/photo-1627530980937-b8721b91506a?auto=format&fit=crop&w=900&q=80',
  },
};

const DEFAULT_CATEGORY_META = {
  description: 'Jelajahi produk terkurasi',
  image:
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80',
};

export const categoryMeta = (slug: string) =>
  CATEGORY_META[slug] ?? DEFAULT_CATEGORY_META;

/**
 * Preferred order for the landing-page category cards (spare part first),
 * independent of the order the API returns categories in. Unlisted slugs
 * keep their original order and fall after the listed ones.
 */
const CATEGORY_CARD_ORDER = ['spare-part-motor', 'aksesoris-motor', 'motor'];

export const categoryCardRank = (slug: string) => {
  const i = CATEGORY_CARD_ORDER.indexOf(slug);
  return i === -1 ? CATEGORY_CARD_ORDER.length : i;
};

export const filterOptions = {
  kondisi: ['Semua', 'Baru', 'Bekas'],
  harga: ['Semua', '< 10 Juta', '10–25 Juta', '25–40 Juta', '> 40 Juta'],
  tahun: ['Semua', '2024–2025', '2021–2023', '2018–2020', '< 2018'],
  lokasi: [
    'Semua',
    'Jakarta',
    'Bandung',
    'Bekasi',
    'Depok',
    'Tangerang',
    'Bogor',
    'Surabaya',
  ],
} as const;

export const searchSuggestions = [
  'NMAX 155',
  'PCX 160',
  'Vario 160',
  'ADV 160',
  'Aerox 155',
  'Vespa Sprint',
];
