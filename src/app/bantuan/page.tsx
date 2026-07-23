import type { Metadata } from 'next';
import { HelpCenterPage } from '../../views/HelpCenterPage';

export const metadata: Metadata = {
  title: 'Pusat Bantuan',
  description:
    'Jawaban seputar akun, pembayaran escrow, Masa Inspeksi, biaya layanan, dan Pusat Resolusi PasarMotor.',
};

export default function Page() {
  return <HelpCenterPage />;
}
