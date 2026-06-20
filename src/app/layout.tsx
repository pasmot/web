import type { Metadata } from 'next';
import '../styles/tokens.css';
import '../styles/globals.css';
import '../styles/landing.css';
import '../styles/catalog.css';
import '../styles/chat.css';
import '../styles/modals.css';

export const metadata: Metadata = {
  title: 'PasarMotor — Beli, Jual & Cek Motor Lebih Yakin',
  description:
    'PasarMotor — marketplace motor yang bantu kamu beli, jual, dan cek kendaraan dengan lebih yakin.',
  icons: {
    icon: '/brand/pasarmotor-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
