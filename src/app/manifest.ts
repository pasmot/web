import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PasarMotor',
    short_name: 'PasarMotor',
    description:
      'Marketplace motor yang bantu kamu beli, jual, dan cek kendaraan dengan lebih yakin.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#d92226',
    icons: [
      { src: '/brand/pm-icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/pm-icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
