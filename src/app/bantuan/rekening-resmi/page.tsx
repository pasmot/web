import type { Metadata } from 'next';
import { LegalPage } from '../../../views/LegalPage';
import { HELP_DOCS_LAST_UPDATED, REKENING_RESMI } from '../../../data/help/documents';

export const metadata: Metadata = {
  title: 'Rekening Escrow Resmi',
  description:
    'Cara memastikan pembayaran kamu masuk ke Rekening Escrow Resmi PasarMotor, dan ciri-ciri penipuan yang perlu diwaspadai.',
};

export default function Page() {
  return (
    <LegalPage
      title="Rekening Escrow Resmi"
      intro="Cara memastikan pembayaran kamu masuk ke rekening yang benar — dan ciri penipuan yang mengatasnamakan PasarMotor."
      lastUpdated={HELP_DOCS_LAST_UPDATED}
      content={REKENING_RESMI}
    />
  );
}
