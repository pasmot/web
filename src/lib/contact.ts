/** Nomor WhatsApp resmi Pasar Motor Indonesia (+62 822-6060-0095), digit saja. */
export const WHATSAPP_NUMBER = '6282260600095';

/**
 * Rapikan nomor HP jadi format wa.me (digit saja, kode negara Indonesia).
 * Menerima "0812…", "+62 812…", "62812-3456", dst. Mengembalikan null kalau
 * nomornya kosong atau terlalu pendek untuk dianggap valid.
 */
export const normalizeWhatsAppNumber = (
  raw?: string | null,
): string | null => {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('62')) {
    // sudah kode negara
  } else if (digits.startsWith('0')) {
    digits = `62${digits.slice(1)}`;
  } else if (digits.startsWith('8')) {
    digits = `62${digits}`;
  }
  // 62 + minimal 9 digit nomor lokal
  return digits.length >= 11 && digits.startsWith('62') ? digits : null;
};

/** Bangun link wa.me dengan pesan yang sudah di-encode. */
export const buildWhatsAppUrl = (message: string, number = WHATSAPP_NUMBER) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

/**
 * Nomor tujuan chat untuk sebuah produk: pakai nomor seller kalau ada dan
 * valid, kalau belum ada jatuh ke nomor resmi PASARMOTOR.
 */
export const sellerWhatsAppNumber = (
  ...candidates: (string | null | undefined)[]
) => {
  for (const candidate of candidates) {
    const normalized = normalizeWhatsAppNumber(candidate);
    if (normalized) return normalized;
  }
  return WHATSAPP_NUMBER;
};
