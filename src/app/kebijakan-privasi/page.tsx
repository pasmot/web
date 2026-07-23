import type { Metadata } from 'next';
import { LegalPage } from '../../views/LegalPage';
import { PRIVACY_LAST_UPDATED, PRIVACY_POLICY_ID } from '../../data/legal/privacy';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description:
    'Bagaimana PasarMotor mengumpulkan, memakai, membagikan, dan melindungi Data Pribadi kamu sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.',
};

export default function Page() {
  return (
    <LegalPage
      title="Kebijakan Privasi"
      intro="Bagaimana PasarMotor mengumpulkan, memakai, membagikan, dan melindungi Data Pribadi kamu — sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi."
      lastUpdated={PRIVACY_LAST_UPDATED}
      content={PRIVACY_POLICY_ID}
    />
  );
}
