/**
 * Fixed inspection fee, shown on the submit button before a request is created
 * (there is no pre-submit fee endpoint yet). Kept in sync manually with the
 * backend — the authoritative amount comes back on the response (fee_amount)
 * and is what the confirmation + list actually display.
 */
export const INSPEKSI_FEE = 299_000;

/** Formats an integer rupiah amount, e.g. 299000 → "Rp299.000". */
export const formatRupiah = (amount: number): string =>
  `Rp${amount.toLocaleString('id-ID')}`;
