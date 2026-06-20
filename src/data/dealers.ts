import type { Dealer } from '../types/dealer';
import { products } from './products';

export const dealers: Dealer[] = [
  {
    id: 'dealer-pasar-motor',
    name: 'Dealer Pasar Motor',
    initials: 'PM',
    location: 'Jakarta Selatan',
    verified: true,
    joined: '2023',
    responseTime: 'Balas ±5 menit',
    whatsapp: '6281234567890',
    description:
      'Dealer terkurasi Pasar Motor dengan showroom di Jakarta Selatan. Semua unit melewati pengecekan dasar sebelum tayang.',
  },
  {
    id: 'berkah-motor-bandung',
    name: 'Berkah Motor Bandung',
    initials: 'BM',
    location: 'Bandung',
    verified: true,
    joined: '2023',
    responseTime: 'Balas ±10 menit',
    whatsapp: '6281298765432',
    description:
      'Spesialis motor matic bekas berkualitas di Bandung dan sekitarnya. Unit bergaransi mesin 1 bulan.',
  },
  {
    id: 'depok-moto-center',
    name: 'Depok Moto Center',
    initials: 'DM',
    location: 'Depok',
    verified: true,
    joined: '2024',
    responseTime: 'Balas ±15 menit',
    whatsapp: '6281355512345',
    description:
      'Showroom keluarga dengan fokus motor harian siap pakai. Bisa bantu proses balik nama dan mutasi.',
  },
  {
    id: 'garasi-moge-jakarta',
    name: 'Garasi Moge Jakarta',
    initials: 'GM',
    location: 'Jakarta Pusat',
    verified: true,
    joined: '2023',
    responseTime: 'Balas ±20 menit',
    whatsapp: '6281288899900',
    description:
      'Kurator motor gede dan motor klasik. Setiap unit dilengkapi riwayat servis dan dokumen lengkap.',
  },
  {
    id: 'surabaya-moto-gallery',
    name: 'Surabaya Moto Gallery',
    initials: 'SG',
    location: 'Surabaya',
    verified: false,
    joined: '2024',
    responseTime: 'Balas ±30 menit',
    whatsapp: '6281377700111',
    description:
      'Galeri motor dan perlengkapan riding di Surabaya. Melayani pengiriman ke seluruh Jawa Timur.',
  },
  {
    id: 'sparepart-station',
    name: 'Sparepart Station',
    initials: 'SS',
    location: 'Jakarta Barat',
    verified: true,
    joined: '2023',
    responseTime: 'Balas ±10 menit',
    whatsapp: '6281211122233',
    description:
      'Toko sparepart original dan aftermarket terpercaya. Semua produk bergaransi keaslian.',
  },
  {
    id: 'gear-garage',
    name: 'Gear Garage',
    initials: 'GG',
    location: 'Jakarta Selatan',
    verified: true,
    joined: '2024',
    responseTime: 'Balas ±10 menit',
    whatsapp: '6281244455566',
    description:
      'Perlengkapan riding pilihan — helm, jaket, boots, sampai box touring. Kurasi barang yang benar-benar layak pakai.',
  },
];

export const getDealer = (id: string): Dealer | undefined =>
  dealers.find((d) => d.id === id);

export const getDealerListings = (dealerId: string) =>
  products.filter((p) => p.seller === dealerId);
