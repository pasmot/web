/**
 * Halaman bantuan yang ditunjuk langsung oleh Syarat & Ketentuan dan Kebijakan
 * Privasi. Isinya wajib konsisten dengan kedua dokumen tersebut.
 */

import { COMPANY } from '../company';

export const HELP_DOCS_LAST_UPDATED = '23 Juli 2026';

export const BIAYA_LAYANAN = `
## Ringkasan Biaya

Harga Unit ditetapkan sepenuhnya oleh Penjual. PasarMotor tidak menetapkan, mengintervensi, atau menjamin kewajaran harga. Di luar harga Unit, biaya yang dapat dikenakan PasarMotor adalah sebagai berikut.

| Jenis Biaya | Besaran | Ditanggung |
| --- | --- | --- |
| Biaya layanan penjualan Unit | 9% per transaksi | Penjual |
| Biaya layanan penjualan Suku Cadang & Aksesori | 9% per transaksi | Penjual |
| Biaya jasa aplikasi | Rp1.000 per transaksi | Pembeli |
| Biaya iklan premium / sorotan | Sesuai tarif yang berlaku per periode | Penjual |
| Biaya layanan pembayaran | Sesuai metode pembayaran yang dipilih | Pembeli |

Seluruh biaya di atas **belum termasuk Pajak Pertambahan Nilai (PPN)** yang berlaku, kecuali dinyatakan lain.

## Biaya yang Tidak Kami Pungut

- Pendaftaran akun — gratis.
- Memasang iklan Unit standar — gratis.
- Menggunakan Montir AI dan fitur pencarian — gratis.

## Yang Tidak Termasuk Biaya Layanan

Biaya-biaya berikut berada di luar kendali PasarMotor dan ditanggung langsung oleh pihak yang bersangkutan:

- Biaya balik nama kepemilikan kendaraan (BBN-KB), pajak, dan denda — ditanggung Pembeli, kecuali diperjanjikan lain secara tertulis.
- Tunggakan pajak dan denda yang timbul sebelum tanggal serah terima — ditanggung Penjual.
- Biaya pengiriman Suku Cadang dan Aksesori sesuai tarif ekspedisi rekanan.
- Biaya jasa inspeksi pihak ketiga, apabila kamu memakainya.
- Angsuran, bunga, dan biaya lain dari Mitra Pembiayaan, apabila kamu mengajukan pembiayaan.

## Kewajiban Pajak Pengguna

Kamu bertanggung jawab secara pribadi atas pelaporan dan pemenuhan kewajiban perpajakan yang timbul dari transaksi yang kamu lakukan, sesuai peraturan perpajakan yang berlaku di Indonesia.

## Perubahan Biaya

PasarMotor berhak mengubah struktur dan besaran biaya dari waktu ke waktu, dengan pemberitahuan sekurang-kurangnya **14 (empat belas) hari kalender** sebelum berlaku melalui aplikasi dan/atau email kamu.

Ketentuan lengkap ada pada Bagian J Syarat & Ketentuan.
`.trim();

export const REKENING_RESMI = `
## Kenapa Halaman Ini Penting

Seluruh pembayaran transaksi di PasarMotor **hanya sah apabila dilakukan ke Rekening Escrow Resmi PasarMotor**. Dana ditahan di rekening tersebut sampai Transaksi Selesai, baru diteruskan ke Penjual.

**Pembayaran ke rekening lain — termasuk rekening pribadi Penjual — sepenuhnya menjadi tanggung jawab pribadi kamu dan tidak mendapat perlindungan apa pun dari PasarMotor.** Pusat Resolusi juga tidak berlaku untuk transaksi di luar escrow.

## Cara Memastikan Rekening yang Kamu Tuju Resmi

1. **Nomor rekening hanya muncul di halaman pembayaran dalam aplikasi**, setelah kamu melakukan checkout. Jangan pernah memakai nomor rekening yang dikirim lewat chat, WhatsApp, SMS, email, atau media sosial.
2. **Nama pemilik rekening selalu ${COMPANY.legalName}** — bukan nama orang perseorangan, bukan nama toko, dan bukan singkatan lain. Kalau nama pemiliknya berbeda, hentikan pembayaran.
3. **Nominal dan kode pembayaran harus sama persis** dengan yang tertera pada halaman pembayaran.
4. **Batas waktu pembayaran 1x24 jam** sejak checkout. Lewat dari itu, pesanan dapat dibatalkan otomatis.

## Ciri Penipuan yang Perlu Kamu Waspadai

- Ada yang mengaku admin PasarMotor dan meminta transfer ke rekening pribadi.
- Diminta membayar "biaya pengiriman", "biaya pajak", atau "biaya pencairan" di luar aplikasi.
- Diminta menyebutkan kata sandi, kode OTP, PIN, atau data kartu pembayaran. **Kami tidak pernah memintanya.**
- Dihubungi dari nomor pribadi yang mengatasnamakan PasarMotor Care.

Kontak resmi PasarMotor Care hanya **${COMPANY.phoneDisplay}** dan **${COMPANY.emailSupport}**.

## Menemukan Hal Mencurigakan?

Hentikan transaksi, jangan transfer, lalu laporkan ke PasarMotor Care melalui halaman Hubungi Kami. Sertakan tangkapan layar percakapan, nomor rekening yang diminta, dan nomor pesanan kamu.
`.trim();

export const KEBIJAKAN_TANDA_JADI = `
## Apa Itu Tanda Jadi

Tanda jadi (*booking fee*) adalah pembayaran sebagian di muka untuk mengunci sebuah Unit, dengan pelunasan dilakukan pada saat serah terima. Tanda jadi **dibayarkan melalui Rekening Escrow Resmi PasarMotor**, bukan langsung ke Penjual.

Setelah tanda jadi diterima, iklan Unit ditandai terkunci dan Penjual tidak boleh menjualnya ke pihak lain selama masa berlaku pemesanan.

## Alur Singkat

1. Pembeli memilih skema **tanda jadi** saat checkout.
2. Pembayaran tanda jadi masuk ke Rekening Escrow Resmi paling lambat 1x24 jam sejak checkout.
3. Penjual menanggapi pesanan paling lambat 2 hari kalender. Tanpa tanggapan, pesanan batal otomatis dan tanda jadi dikembalikan penuh.
4. Pembeli dan Penjual menyepakati waktu dan tempat serah terima.
5. Pelunasan dilakukan pada saat serah terima, dilanjutkan dengan Masa Inspeksi 3 hari kalender.

## Kapan Tanda Jadi Dikembalikan Penuh

- Penjual membatalkan pesanan atau tidak menanggapi dalam batas waktu.
- Unit ternyata tidak sesuai dengan deskripsi pada iklan secara material — misalnya merek, tipe, tahun, atau warna berbeda; nomor rangka/mesin tidak cocok dengan Dokumen Kendaraan; Dokumen Kendaraan tidak diserahkan, tidak lengkap, atau tidak sah; atau Unit ternyata berstatus blokir maupun objek jaminan fidusia.
- Unit sudah terjual ke pihak lain atau tidak lagi tersedia.
- Transaksi dibatalkan oleh PasarMotor karena indikasi kecurangan atau pelanggaran hukum.

Pengembalian dana masuk ke **Saldo Refund** dan dapat kamu pakai untuk transaksi berikutnya atau ditarik ke rekening bank terdaftar.

## Kapan Tanda Jadi Dapat Hangus

- Pembeli membatalkan pemesanan secara sepihak tanpa alasan sebagaimana disebut di atas.
- Pembeli tidak melakukan pelunasan sampai batas waktu yang disepakati bersama Penjual.
- Pembeli tidak dapat dihubungi hingga masa berlaku pemesanan berakhir.

## Kalau Terjadi Perbedaan Pendapat

Ajukan kendala melalui Pusat Resolusi. Dana tanda jadi tetap ditahan di escrow sampai kendala selesai. Bila tidak tercapai kesepakatan, PasarMotor memutuskan penyaluran dana berdasarkan bukti yang tersedia — tanpa menghapus hak para pihak menempuh jalur hukum.

Ketentuan transaksi selengkapnya ada pada Bagian E dan Bagian F Syarat & Ketentuan.
`.trim();

export const HAK_DATA_PRIBADI = `
## Hak Kamu sebagai Subjek Data Pribadi

Berdasarkan Pasal 5 sampai Pasal 15 UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi, kamu berhak untuk:

1. Memperoleh **informasi** tentang identitas kami, dasar hukum, dan tujuan pemrosesan.
2. **Melengkapi, memperbarui, atau memperbaiki** data yang keliru atau tidak akurat.
3. **Mengakses dan memperoleh salinan** Data Pribadi kamu.
4. **Mengakhiri pemrosesan, menghapus, atau memusnahkan** Data Pribadi kamu.
5. **Menarik kembali persetujuan** atas pemrosesan Data Pribadi kamu.
6. **Mengajukan keberatan** atas keputusan yang hanya didasarkan pada pemrosesan otomatis, termasuk pemrofilan.
7. **Menunda atau membatasi** pemrosesan secara proporsional.
8. **Menuntut dan menerima ganti rugi** atas pelanggaran pemrosesan Data Pribadi kamu.
9. **Memindahkan (portabilitas)** Data Pribadi kamu ke Pengendali Data Pribadi lain, sepanjang sistemnya saling sesuai.

## Cara Mengajukan Permohonan

Kirim permohonan ke **${COMPANY.emailPrivacy}** dengan subjek "Permohonan Hak Subjek Data — [jenis permohonan]", atau hubungi PasarMotor Care di ${COMPANY.phoneDisplay}.

Agar dapat kami proses, sertakan:

- Nama lengkap dan nomor telepon yang terdaftar di akun kamu.
- Jenis permohonan (akses, perbaikan, penghapusan, penarikan persetujuan, keberatan, pembatasan, atau portabilitas).
- Penjelasan singkat mengenai data yang dimaksud.
- Dokumen identitas untuk verifikasi. **Samarkan bagian yang tidak diperlukan**, dan jangan pernah mengirimkan kata sandi, kode OTP, atau data kartu pembayaran.

## Berapa Lama Diproses

Kami memverifikasi identitas kamu terlebih dahulu, lalu menanggapi permohonan **paling lambat 3 x 24 (tiga kali dua puluh empat) jam** sejak permohonan diterima, sesuai Pasal 21 dan Pasal 30 UU PDP.

## Hal yang Perlu Kamu Ketahui

- **Penghapusan akun tidak menghapus seluruh data.** Data transaksi dan data verifikasi identitas tetap kami simpan selama jangka waktu pada Bagian G Kebijakan Privasi, karena kewajiban hukum perpajakan dan anti pencucian uang.
- **Menarik persetujuan dapat menghentikan sebagian atau seluruh Layanan**, hingga penutupan akun. Kami akan memberi tahu konsekuensinya sebelum permohonan diproses.
- **Kami dapat menolak sebagian permohonan** sepanjang diizinkan peraturan perundang-undangan — misalnya bila membahayakan keamanan negara, mengganggu penegakan hukum, atau bertentangan dengan kewajiban penyimpanan data. Alasan penolakan disampaikan secara tertulis.

## Belum Puas dengan Tanggapan Kami?

Kamu berhak menyampaikan pengaduan kepada lembaga pelindungan data pribadi yang berwenang di Republik Indonesia. Pejabat Pelindungan Data Pribadi (DPO) kami: **${COMPANY.dpoName}** — ${COMPANY.emailPrivacy}.
`.trim();
