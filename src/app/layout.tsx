import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/tokens.css';
import '../styles/globals.css';
import '../styles/landing.css';
import '../styles/catalog.css';
import '../styles/chat.css';
import '../styles/modals.css';
import { AppProvider } from '../context/AppContext';
import { Shell } from '../components/layout/Shell';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'PasarMotor — Beli, Jual & Cek Motor Lebih Yakin',
    template: '%s · PasarMotor',
  },
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
    <html lang="id" className={inter.variable}>
      <body>
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
