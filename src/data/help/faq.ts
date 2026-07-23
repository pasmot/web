/**
 * Isi Pusat Bantuan. Jawaban di sini mengikuti Syarat & Ketentuan dan Kebijakan
 * Privasi — kalau salah satu dokumen itu berubah, samakan juga jawabannya.
 */

export type FaqItem = { q: string; a: string };
export type FaqTopic = { id: string; title: string; blurb: string; items: FaqItem[] };

export const FAQ_TOPICS: FaqTopic[] = [
  {
    id: 'akun',
    title: 'Akun & Keamanan',
    blurb: 'Daftar, verifikasi penjual, dan menjaga akun tetap aman.',
    items: [
      {
        q: 'Bagaimana cara daftar akun PasarMotor?',
        a: 'Klik "Masuk", lalu pilih Login dengan Google — akun langsung terbentuk, gratis, tanpa biaya pendaftaran. Nomor telepon kamu lengkapi belakangan di profil, dan dipakai untuk komunikasi transaksi. Layanan ini khusus untuk kamu yang berusia 18 tahun ke atas.',
      },
      {
        q: 'Bisakah saya punya lebih dari satu akun?',
        a: 'Tidak. Satu nomor telepon hanya bisa dipakai untuk satu akun, dan membuat akun ganda untuk memanipulasi reputasi, memanfaatkan promo, atau menghindari sanksi dilarang.',
      },
      {
        q: 'Kenapa saya harus verifikasi identitas untuk jadi Penjual?',
        a: 'Verifikasi identitas (KYC) berupa KTP, NPWP, dan/atau selfie verifikasi wajib dilengkapi sebelum iklan Unit bisa tayang. Tujuannya mencegah penipuan dan memenuhi kewajiban anti pencucian uang. PasarMotor berhak menolak atau menunda verifikasi berdasarkan penilaian internal.',
      },
      {
        q: 'Apakah PasarMotor pernah meminta OTP atau kata sandi?',
        a: 'Tidak pernah. Kami tidak pernah meminta kata sandi akun Google kamu, kode OTP, PIN, atau data kartu pembayaran melalui saluran apa pun — termasuk telepon, WhatsApp, email, atau chat. Kalau ada yang meminta dengan mengatasnamakan PasarMotor, itu penipuan. Laporkan ke kami.',
      },
      {
        q: 'Akun saya dibekukan atau iklan saya diturunkan. Kenapa?',
        a: 'Kami dapat menurunkan iklan, membatalkan transaksi, membekukan saldo, atau menutup akun bila ada dugaan pelanggaran Syarat & Ketentuan atau hukum yang berlaku. Hubungi PasarMotor Care untuk penjelasan dan proses banding.',
      },
    ],
  },
  {
    id: 'beli',
    title: 'Membeli Motor',
    blurb: 'Pembayaran escrow, Masa Inspeksi, dan konfirmasi penerimaan.',
    items: [
      {
        q: 'Bagaimana alur pembeliannya?',
        a: 'Pilih Unit → checkout → bayar ke Rekening Escrow Resmi PasarMotor (penuh atau tanda jadi) → Penjual menanggapi pesanan maksimal 2 hari kalender → serah terima Unit → Masa Inspeksi → konfirmasi penerimaan. Dana baru diteruskan ke Penjual setelah transaksi dinyatakan selesai.',
      },
      {
        q: 'Apa itu Rekening Escrow Resmi dan kenapa wajib lewat situ?',
        a: 'Escrow adalah rekening penampungan yang menahan dana sampai transaksi selesai, jadi uangmu tidak langsung diterima Penjual. Pembayaran di luar Rekening Escrow Resmi sepenuhnya jadi tanggung jawab pribadi kamu dan tidak mendapat perlindungan apa pun dari PasarMotor.',
      },
      {
        q: 'Berapa lama Masa Inspeksi setelah motor saya terima?',
        a: 'Untuk Unit, 3 hari kalender sejak serah terima. Untuk suku cadang dan aksesori, 2 hari kalender sejak status pengiriman tercatat "terkirim". Selama masa itu kamu bisa konfirmasi penerimaan atau mengajukan keberatan lewat Pusat Resolusi.',
      },
      {
        q: 'Kalau saya diam saja sampai Masa Inspeksi habis?',
        a: 'Sistem akan menganggap kamu menyetujui penerimaan, transaksi otomatis selesai, dan dana diteruskan ke Penjual. Jadi pastikan memeriksa Unit dan dokumennya sebelum masa itu berakhir.',
      },
      {
        q: 'Apa yang wajib saya cek sebelum konfirmasi penerimaan?',
        a: 'Cocokkan fisik nomor rangka dan nomor mesin dengan BPKB dan STNK, cek status kendaraan lewat layanan resmi kepolisian/Samsat setempat, serta cek status blokir, pajak progresif, dan tunggakan pajak. Pemeriksaan ini tanggung jawab Pembeli.',
      },
      {
        q: 'Berapa batas maksimal satu transaksi?',
        a: 'Rp200.000.000 per transaksi, dan hanya dalam mata uang Rupiah.',
      },
    ],
  },
  {
    id: 'jual',
    title: 'Menjual Motor',
    blurb: 'Aturan iklan, dokumen kendaraan, dan pencairan dana.',
    items: [
      {
        q: 'Apa saja yang wajib dicantumkan di iklan?',
        a: 'Merek, tipe, dan tahun perakitan; nomor polisi (boleh disamarkan sebagian) dan masa berlaku STNK; angka odometer; status kepemilikan (tangan ke-berapa); status Dokumen Kendaraan; riwayat kecelakaan besar/banjir/ganti rangka bila diketahui; serta status leasing. Foto wajib asli, terkini, dan diambil sendiri.',
      },
      {
        q: 'Boleh menyembunyikan cacat kecil?',
        a: 'Tidak. Menyembunyikan cacat material yang kamu ketahui — rangka bengkok atau bekas las, mesin turun, kerusakan transmisi, odometer diubah, bekas kecelakaan berat atau terendam banjir — dilarang dan bisa berujung pembatalan transaksi serta penutupan akun.',
      },
      {
        q: 'Kapan dana penjualan saya cair?',
        a: 'Setelah Transaksi Selesai, dana masuk ke Saldo Penghasilan. Penarikan ke rekening bank terdaftar diproses 1x24 jam hari kerja untuk bank yang sama dan 2x24 jam hari kerja untuk antarbank. Rekening tujuan harus atas nama yang sama dengan pemilik akun terverifikasi.',
      },
      {
        q: 'Siapa yang mengurus balik nama?',
        a: 'Biaya, pengurusan, dan risiko balik nama (BBN-KB) menjadi tanggung jawab Pembeli, kecuali diperjanjikan lain secara tertulis. Penjual wajib membantu secara wajar, dan sebaiknya melapor jual/blokir ke Samsat setempat agar tidak terkena pajak progresif.',
      },
    ],
  },
  {
    id: 'kendala',
    title: 'Kendala & Pusat Resolusi',
    blurb: 'Kalau Unit tidak sesuai atau transaksi bermasalah.',
    items: [
      {
        q: 'Unit tidak sesuai iklan. Apa yang harus saya lakukan?',
        a: 'Ajukan keberatan lewat Pusat Resolusi selama Masa Inspeksi. Dana otomatis ditahan di escrow sampai kendala selesai. Siapkan bukti: foto dan video Unit, foto Dokumen Kendaraan, kuitansi, bukti serah terima, hasil pengecekan Samsat, dan/atau hasil inspeksi bengkel.',
      },
      {
        q: 'Keberatan seperti apa yang tidak bisa diproses?',
        a: 'Hal-hal subjektif seperti selera warna, suara mesin dalam batas wajar, atau keausan wajar sesuai usia dan kilometer Unit tidak bisa dijadikan dasar pembatalan transaksi.',
      },
      {
        q: 'Apa peran PasarMotor saat ada sengketa?',
        a: 'Kami mediator dan fasilitator, bukan arbiter atau penanggung kerugian. Bila tidak tercapai kesepakatan, kami memutuskan penyaluran dana yang ditahan di escrow berdasarkan bukti. Keputusan itu tidak menghapus hak Pembeli maupun Penjual menempuh jalur hukum satu sama lain.',
      },
      {
        q: 'Bagaimana kalau lawan transaksi tidak merespons?',
        a: 'Bila salah satu pihak tidak menanggapi dalam 3 hari kalender, kendala dapat diselesaikan berdasarkan solusi yang diajukan pihak lainnya. Tersedia satu kali banding dengan syarat ada bukti baru.',
      },
    ],
  },
];
