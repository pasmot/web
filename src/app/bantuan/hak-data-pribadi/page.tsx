import type { Metadata } from "next";
import { LegalPage } from "../../../views/LegalPage";
import {
  HAK_DATA_PRIBADI,
  HELP_DOCS_LAST_UPDATED,
} from "../../../data/help/documents";

export const metadata: Metadata = {
  title: "Hak atas Data Pribadi",
  description:
    "Cara mengajukan permohonan akses, perbaikan, penghapusan, atau pemindahan Data Pribadi kamu di PASARMOTOR sesuai UU PDP.",
};

export default function Page() {
  return (
    <LegalPage
      title="Hak atas Data Pribadi"
      intro="Hak kamu menurut UU No. 27 Tahun 2022, cara mengajukan permohonan, dan berapa lama kami memprosesnya."
      lastUpdated={HELP_DOCS_LAST_UPDATED}
      content={HAK_DATA_PRIBADI}
    />
  );
}
