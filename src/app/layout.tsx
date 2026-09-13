import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '../styles/tokens.css';
import '../styles/globals.css';
import '../styles/landing.css';
import '../styles/catalog.css';
import '../styles/chat.css';
import '../styles/modals.css';
import '../styles/legal.css';
import '../styles/help.css';
import '../styles/seller.css';
import { AppProvider } from '../context/AppContext';
import { Shell } from '../components/layout/Shell';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pasarmotor.com';
const siteTitle = 'PasarMotor — Beli, Jual & Cek Motor Lebih Yakin';
const siteDescription =
  'PasarMotor — marketplace motor yang bantu kamu beli, jual, dan cek kendaraan dengan lebih yakin.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: '%s · PasarMotor',
  },
  description: siteDescription,
  applicationName: 'PasarMotor',
  openGraph: {
    type: 'website',
    siteName: 'PasarMotor',
    locale: 'id_ID',
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={plusJakartaSans.variable}
      data-scroll-behavior="smooth"
    >
      <body>
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
