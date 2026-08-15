import type { Metadata } from "next";
import { LegalPage } from "../../../views/LegalPage";
import {
  HELP_DOCS_LAST_UPDATED,
  KEBIJAKAN_TANDA_JADI,
} from "../../../data/help/documents";

export const metadata: Metadata = {
  title: "Kebijakan Tanda Jadi",
  description:
    "Aturan tanda jadi (booking fee) di PASARMOTOR: alur pembayaran, kapan dikembalikan penuh, dan kapan dapat hangus.",
};

export default function Page() {
  return (
    <LegalPage
      title="Kebijakan Tanda Jadi"
      intro="Aturan tanda jadi (booking fee): alurnya, kapan dana dikembalikan penuh, dan kapan bisa hangus."
      lastUpdated={HELP_DOCS_LAST_UPDATED}
      content={KEBIJAKAN_TANDA_JADI}
    />
  );
}
