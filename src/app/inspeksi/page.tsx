import type { Metadata } from 'next';
import { InspeksiBinding } from '../../views/bindings/InspeksiBinding';

export const metadata: Metadata = {
  title: 'Jasa Inspeksi',
  description:
    'Pantau permintaan inspeksi unitmu — montir cek mesin, rangka, CVT, kelistrikan, dan dokumen.',
};

export default function Page() {
  return <InspeksiBinding />;
}
