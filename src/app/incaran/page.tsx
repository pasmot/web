import type { Metadata } from "next";
import { SavedBinding } from "../../views/bindings/SavedBinding";

export const metadata: Metadata = {
  title: "Incaran",
  description: "Produk yang kamu simpan sebagai shortlist di PASARMOTOR.",
};

export default function Page() {
  return <SavedBinding />;
}
