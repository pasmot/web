/** Nomor WhatsApp resmi Pasar Motor Indonesia (+62 822-6060-0095), digit saja. */
export const WHATSAPP_NUMBER = '6282260600095';

/** Bangun link wa.me dengan pesan yang sudah di-encode. */
export const buildWhatsAppUrl = (message: string, number = WHATSAPP_NUMBER) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
