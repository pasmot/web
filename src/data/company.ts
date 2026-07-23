/**
 * Identitas & kontak resmi Pasar Motor — satu sumber kebenaran untuk halaman
 * bantuan, kontak, dan dokumen resmi. Nilainya mengikuti Syarat & Ketentuan
 * serta Kebijakan Privasi.
 */

export const COMPANY = {
  legalName: 'PT PASAR MOTOR INDONESIA',
  brandName: 'PasarMotor',
  address:
    'Gedung Artha Graha, Jl. Jend. Sudirman Kav. 52-53 No. 30, Blok 52-53, RT.5/RW.3, Senayan, Kec. Kebayoran Baru, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12190',
  /** Ditampilkan ke pengguna; versi digit-only ada di lib/contact.ts */
  phoneDisplay: '+62 822-6060-0095',
  emailSupport: 'admin@pasarmotor.com',
  emailPrivacy: 'privasi@pasarmotor.com',
  /** Pejabat Pelindungan Data Pribadi (Pasal 53 UU PDP). */
  dpoName: 'Pratama Suherman',
  supportHours: 'Senin–Sabtu, 09.00–18.00 WIB',
  /**
   * Tautan aplikasi. Selama masih kosong, tombol unduh ditampilkan sebagai
   * "segera hadir" dan tidak bisa diklik — isi begitu aplikasi terbit.
   */
  appStoreUrl: '',
  playStoreUrl: '',
} as const;
