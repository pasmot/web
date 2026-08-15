import type { Metadata } from "next";
import { LegalPage } from "../../views/LegalPage";
import { TERMS_ID, TERMS_LAST_UPDATED } from "../../data/legal/terms";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description:
    "Aturan main jual-beli di PASARMOTOR: akun, iklan Unit, dokumen kendaraan, escrow, masa inspeksi, biaya layanan, dan penyelesaian sengketa.",
};

export default function Page() {
  return (
    <LegalPage
      title="Syarat & Ketentuan"
      intro="Aturan main jual-beli di PASARMOTOR: akun, iklan Unit, Dokumen Kendaraan, escrow, Masa Inspeksi, biaya layanan, dan penyelesaian sengketa."
      lastUpdated={TERMS_LAST_UPDATED}
      content={TERMS_ID}
    />
  );
}
