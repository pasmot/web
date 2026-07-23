import type { Metadata } from 'next';
import { LegalPage } from '../../../views/LegalPage';
import { BIAYA_LAYANAN, HELP_DOCS_LAST_UPDATED } from '../../../data/help/documents';

export const metadata: Metadata = {
  title: 'Biaya Layanan',
  description:
    'Rincian biaya layanan PasarMotor: biaya penjualan, biaya jasa aplikasi, iklan premium, dan biaya di luar tanggungan kami.',
};

export default function Page() {
  return (
    <LegalPage
      title="Biaya Layanan"
      intro="Rincian biaya yang dikenakan PasarMotor pada transaksi jual-beli — beserta biaya yang berada di luar tanggungan kami."
      lastUpdated={HELP_DOCS_LAST_UPDATED}
      content={BIAYA_LAYANAN}
    />
  );
}
