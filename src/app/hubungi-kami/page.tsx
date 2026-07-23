import type { Metadata } from 'next';
import { ContactPage } from '../../views/ContactPage';

export const metadata: Metadata = {
  title: 'Hubungi Kami',
  description:
    'Kontak resmi PasarMotor Care — WhatsApp, email layanan pengguna, dan email urusan data pribadi.',
};

export default function Page() {
  return <ContactPage />;
}
