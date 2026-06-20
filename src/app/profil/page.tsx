import type { Metadata } from 'next';
import { ProfileBinding } from '../../views/bindings/ProfileBinding';

export const metadata: Metadata = {
  title: 'Profil & Akun',
  description: 'Kelola akun member PasarMotor kamu.',
};

export default function Page() {
  return <ProfileBinding />;
}
