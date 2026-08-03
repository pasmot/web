import type { Metadata } from 'next';
import { SellerRegistrationPage } from '../../views/SellerRegistrationPage';

export const metadata: Metadata = {
  title: 'Daftar Jadi Penjual',
  description:
    'Daftarkan kios dan mulai berjualan di PasarMotor — masuk dengan Google, lengkapi detail toko, dan langsung pasang listing.',
};

export default function Page() {
  return <SellerRegistrationPage />;
}
