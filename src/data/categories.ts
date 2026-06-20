import type { ProductCategory } from '../types/product';

export type CategoryDef = {
  id: ProductCategory;
  label: string;
  description: string;
  image: string;
};

export const categories: CategoryDef[] = [
  {
    id: 'motor',
    label: 'Motor',
    description: 'Motor baru & bekas terkurasi',
    image:
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'sparepart',
    label: 'Sparepart',
    description: 'Part original & aftermarket',
    image:
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'aksesoris',
    label: 'Aksesoris',
    description: 'Helm, jaket & gear riding',
    image:
      'https://images.unsplash.com/photo-1627530980937-b8721b91506a?auto=format&fit=crop&w=900&q=80',
  },
];

export const filterOptions = {
  jenis: ['Semua', 'Motor Baru', 'Motor Bekas', 'Sparepart Baru', 'Aksesoris Baru'],
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
