# Katalog Publik — Panduan Implementasi Frontend

Panduan perubahan endpoint `GET /api/v1/catalog/listings` setelah sumber datanya dipindah ke tabel enrichment GenAI.

Referensi lengkap parameter ada di [`api.md`](./api.md). Dokumen ini fokus ke **apa yang perlu diubah di frontend**.

---

## TL;DR

| | |
|---|---|
| **Wajib diubah** | 1 hal saja — filter CC (`cc_min`/`cc_max` → `cc_range`) |
| **Bisa rusak diam-diam** | Ya. Parameter lama tidak error, cuma diabaikan |
| **Response berubah?** | Tidak ada field yang hilang. Hanya penambahan 12 field baru |
| **Perlu ubah rendering?** | Tidak wajib. Tapi field baru banyak yang `null` — lihat [Menangani null](#menangani-null) |
| **Error handling baru** | Ya. Filter dengan nilai invalid sekarang balas **400**, bukan 200 |
| **Opsi dropdown** | Ambil dari `GET /api/v1/catalog/facets`. **Jangan hardcode enum di FE** |

---

## 1. WAJIB — ganti filter CC

Ini satu-satunya hal yang **pasti rusak** kalau tidak diubah.

Kapasitas mesin sekarang berupa label diskrit, bukan angka. Slider/input angka harus diganti dropdown.

```diff
- GET /api/v1/catalog/listings?cc_min=150&cc_max=250
+ GET /api/v1/catalog/listings?cc_range=150-250cc
```

> **Hati-hati:** `cc_min` dan `cc_max` tidak menghasilkan error — API hanya mengabaikannya dan mengembalikan hasil **tanpa filter**. Jadi gejalanya bukan "error", tapi "filter CC tidak berfungsi".

Opsi dropdown-nya **jangan dihardcode** — ambil dari `GET /api/v1/catalog/facets` (lihat [bagian 4](#4-opsi-filter-ambil-dari-facets)). Backend sudah menyaring nilai placeholder dan mengurutkannya secara progresif.

---

## 2. Error handling baru — 400

Sebelumnya filter dengan nilai ngawur diabaikan diam-diam dan tetap balas `200`. Sekarang balas **`400`** dengan nama parameter yang bermasalah.

```json
{
  "success": false,
  "errors": [
    { "status_code": "400", "detail": "invalid value for query parameter: min_price" }
  ]
}
```

Yang divalidasi: `category_id`, `seller_id`, `min_price`, `max_price`, `min_discount_pct`, `year_min`, `year_max`, `is_verified`, `is_store`, `include_suspect`.

- Angka harus integer (`12.5` ditolak).
- Boolean menerima `true`/`false`/`1`/`0` (`yes`/`ya` **ditolak**).
- Parameter kosong (`?min_price=`) atau tidak dikirim = tidak difilter, bukan error.
- `page` dan `limit` **tetap lenient** — nilai invalid jatuh ke default, tidak error.

> **Cek serialisasi filter kalian.** Kalau state filter yang kosong terkirim sebagai `"undefined"` atau `"NaN"`, sekarang jadi 400. Kirim parameter hanya kalau ada nilainya.

Nilai string sekarang di-**trim**, jadi `?condition=%20bekas%20` sama dengan `?condition=bekas`.

---

## 3. Response — semua field lama tetap ada

Tidak ada breaking change di rendering. `id` tetap integer, jadi tombol bookmark & inspeksi tetap jalan.

```ts
export interface CatalogListing {
  // --- field lama, tidak berubah ---
  id: number                    // PK integer -> dipakai /listings/{id}/bookmark & /inspections
  listing_id: string            // ID publik -> dipakai /catalog/listings/{listing_id}
  seller_id: number | null
  category_id: number | null
  title: string | null
  price: number | null
  price_text: string | null
  condition: string | null
  city: string | null
  province: string | null
  scraped_at: string | null
  primary_image_url: string | null
  seller_name: string | null
  seller_city: string | null

  // --- BARU ---
  status: string                // "active" | "sold"
  seller_type: string | null    // "perorangan" | "toko"
  is_verified: boolean | null
  is_store: boolean | null
  category_name: string | null
  source: string | null
  discount_pct: number | null   // belum terisi, lihat catatan
  is_suspect: boolean | null

  // --- BARU: hasil taxonomy AI (sering null, lihat di bawah) ---
  llm_output_brand: string | null
  llm_output_tipe_motor: string | null
  llm_output_cc_range: string | null
  llm_output_kondisi_orisinalitas: string | null
}

export interface CatalogResponse {
  success: boolean
  status_code: number
  data: CatalogListing[]
  meta: { total_count: number; page: number; per_page: number }
}
```

### Menangani null

Field `llm_output_*` **hanya terisi di ~8,5% baris** (yang `category_name = "Motor"`). Sisanya spare part & aksesoris, semuanya `null`.

Jangan render chip/badge kosong:

```tsx
{listing.llm_output_brand && <Badge>{listing.llm_output_brand}</Badge>}
{listing.llm_output_tipe_motor && <Badge>{listing.llm_output_tipe_motor}</Badge>}
```

`primary_image_url` juga `null` di ~200 baris — siapkan placeholder image.

---

## 4. Opsi filter: ambil dari /facets

**Jangan hardcode daftar brand, tipe motor, cc range, dsb. di frontend.** Semua ada di satu endpoint:

```
GET /api/v1/catalog/facets
```

```json
{
  "success": true,
  "data": {
    "brand": [
      { "value": "Honda", "label": "Honda",           "count": 991 },
      { "value": "Vespa", "label": "Vespa / Piaggio", "count": 93  }
    ],
    "tipe_motor":           [ { "value": "Matic", "label": "Matic", "count": 248 } ],
    "cc_range":             [ { "value": "<150cc", "label": "Di bawah 150cc", "count": 320 } ],
    "kondisi_orisinalitas": [ { "value": "Orisinil/Standar", "label": "Orisinil / Standar", "count": 432 } ],
    "category_name":        [ { "value": "Motor", "label": "Motor", "count": 498 } ],
    "source":               [ { "value": "olx", "label": "OLX", "count": 296 } ],
    "condition":            [ { "value": "bekas", "label": "Bekas", "count": 591 } ],
    "seller_type":          [ { "value": "toko", "label": "Toko", "count": 55 } ]
  }
}
```

Cara pakai: `value` dikirim balik apa adanya sebagai query param, `label` ditampilkan ke user, `count` boleh ditampilkan di samping opsi.

```ts
type FacetOption = { value: string; label: string; count: number }

type Facets = Record<
  'brand' | 'tipe_motor' | 'cc_range' | 'kondisi_orisinalitas'
  | 'category_name' | 'source' | 'condition' | 'seller_type',
  FacetOption[]
>

const { data: facets } = await fetch('/api/v1/catalog/facets').then(r => r.json())

// <Select> options — value dipakai apa adanya, jangan diutak-atik
facets.brand.map(o => ({ value: o.value, label: `${o.label} (${o.count})` }))
```

Yang sudah diurus backend, jadi FE tidak perlu memfilter apa pun:

- Opsi dengan `count = 0` tidak dikirim — tidak akan ada dropdown yang hasilnya kosong.
- Placeholder `Tidak diketahui` dan nilai rusak `250-250cc` sudah disaring.
- `cc_range` sudah urut progresif, bukan by count. Facet lain urut by count menurun.
- Label sudah dirapikan (`Sport/Naked` → "Sport / Naked", `fb_marketplace` → "Facebook Marketplace").

> **`value` bukan nilai kolom mentah — kirim apa adanya.** Contoh: brand Vespa punya `value: "Vespa"` walau di database tersimpan `"Vespa/Piaggio"`. Kalau FE "membetulkan" jadi `Vespa/Piaggio`, hasilnya turun dari 93 ke 14 baris, karena string berslash itu tidak pernah cocok dengan judul listing.

### Filter yang tidak punya facet

Ini free-form atau boolean, tidak perlu daftar opsi:

| Param | Nilai | Keterangan |
|---|---|---|
| `q` | bebas | Cari di `search_text` (judul + deskripsi) |
| `city`, `province` | bebas | **Exact match** case-insensitive — `Bogor` tidak cocok dengan "Bogor Barat" |
| `seller_name` | bebas | Partial match |
| `min_price`, `max_price` | angka | IDR |
| `year_min`, `year_max` | angka | Diambil via regex dari judul |
| `category_slug`, `category_id`, `seller_id` | - | Filter lama, tetap jalan |
| `is_verified`, `is_store` | `true` / `false` | Tidak dikirim = tanpa filter |
| `status` | `active`, `sold` | Saat ini semua `active` |
| `include_suspect` | `true` / `false` | Default `false` |

### Kenapa brand tidak diambil dari kolom taxonomy

Pertanyaan yang sempat muncul: "bisa nggak pakai semua isi `llm_output_brand`?" — **jangan**, ada tiga alasannya:

1. **Kolomnya cuma terisi 8,5%.** Nilainya hanya 7: Honda, Yamaha, Kawasaki, Suzuki, Vespa/Piaggio, Lainnya, Tidak diketahui. Sisanya (91,5%) `NULL`.
2. **Daftarnya tidak lengkap.** Ducati (17 listing), Bajaj (13), Benelli (7), dan Aprilia (4) sama sekali tidak punya baris taxonomy — hanya ada di judul spare part. Kalau dropdown dibuat dari `DISTINCT llm_output_brand`, merek-merek itu hilang padahal listing-nya ada dan bisa dicari.
3. **Hitungannya jauh meleset.** Filter `brand` mencocokkan kolom **atau** judul, jadi `?brand=Honda` mengembalikan 991 baris, bukan 234 seperti isi kolomnya. Ini disengaja supaya spare part bermerek ikut kena.

Karena itu daftar brand dikurasi di backend (`catalogBrands` di `internal/service/catalog_facets.go`) dan disajikan lewat `/facets` dengan hitungan yang benar. Kalau butuh merek baru, minta backend menambahkannya di situ — jangan ditambal di FE.

---

## 5. Perubahan perilaku

### Jumlah item turun: 5.990 → 5.888

- 90 listing belum di-enrich oleh pipeline dan tidak muncul.
- 12 listing ditandai `is_suspect` dan disembunyikan.

Tidak ada aksi yang diperlukan, hanya jangan kaget kalau total berubah.

### `is_suspect` disembunyikan default

Flag dari pipeline eksternal yang menandai barang yang kemungkinan bukan motor (semuanya "sepeda listrik"). Kirim `include_suspect=true` kalau butuh (misal untuk halaman ops/QA), bukan untuk katalog user.

### Urutan sekarang deterministik

`ORDER BY scraped_at DESC, listing_id DESC`. Sebelumnya baris dengan `scraped_at` sama bisa muncul di dua halaman berbeda saat paginasi. Sekarang tidak.

### Wildcard di-escape

`%` dan `_` dicocokkan literal. Kalau sebelumnya ada yang sengaja kirim `?city=%` untuk "semua kota", sekarang hasilnya 0 — cukup jangan kirim parameternya.

---

## 6. Jangan dipakai dulu

| Field / Param | Alasan |
|---|---|
| `min_discount_pct` | Kolom `discount_pct` bernilai `0` di semua baris. Filter apa pun di atas 0 mengembalikan 0 hasil |
| `discount_pct` (display) | Sama — akan tampil "0%" di semua kartu |
| `rating` | 100% `NULL`, tidak diekspos sebagai filter |

Semua ini menunggu pipeline mengisi datanya. Struktur API-nya sudah siap.

---

## 7. Contoh

**Katalog default**

```
GET /api/v1/catalog/listings?page=1&limit=20
```

**Motor matic Honda bekas, 150–250cc**

```
GET /api/v1/catalog/listings
  ?category_name=Motor
  &tipe_motor=Matic
  &cc_range=150-250cc
  &brand=Honda
  &condition=bekas
  &limit=20
```

> **Belum ada parameter sorting.** Urutan selalu `scraped_at DESC` (terbaru dulu). Kalau UI butuh "urut termurah" atau "urut termahal", itu perlu ditambahkan dulu di backend — jangan sort di sisi klien karena datanya terpaginasi.

**Hanya seller toko terverifikasi**

```
GET /api/v1/catalog/listings?seller_type=toko&is_verified=true
```

**Contoh response**

```json
{
  "success": true,
  "status_code": 200,
  "data": [
    {
      "id": 9193,
      "listing_id": "facebook_1003384996016241",
      "seller_id": 9419,
      "category_id": 1,
      "status": "active",
      "title": "Honda Vario 150 LED",
      "price": 16000000,
      "price_text": "Rp 16.000.000",
      "condition": "bekas",
      "city": "Bintaro",
      "province": "Bintaro",
      "scraped_at": "2026-07-23T06:55:22.892+07:00",
      "primary_image_url": null,
      "seller_name": "Muhammad Mahfuzd Azalli",
      "seller_city": "Bintaro",
      "seller_type": "perorangan",
      "is_verified": false,
      "is_store": false,
      "category_name": "Motor",
      "source": "facebook",
      "discount_pct": null,
      "is_suspect": false,
      "llm_output_brand": "Honda",
      "llm_output_tipe_motor": "Matic",
      "llm_output_cc_range": "150-250cc",
      "llm_output_kondisi_orisinalitas": "Orisinil/Standar"
    }
  ],
  "meta": { "total_count": 248, "page": 1, "per_page": 1 }
}
```

---

## 8. Checklist implementasi

- [ ] Ganti input CC dari slider/angka jadi dropdown `cc_range`
- [ ] Hapus `cc_min` & `cc_max` dari semua pemanggilan API
- [ ] Fetch `GET /api/v1/catalog/facets` untuk semua opsi dropdown
- [ ] Hapus semua enum filter yang terlanjur dihardcode di FE
- [ ] Kirim `value` dari facets **apa adanya** — jangan diubah/dinormalisasi
- [ ] Tambah handling response `400` (tampilkan pesan, jangan anggap list kosong)
- [ ] Pastikan filter kosong **tidak dikirim** sebagai parameter
- [ ] Tambah null-guard untuk semua field `llm_output_*`
- [ ] Tambah placeholder untuk `primary_image_url` yang `null`
- [ ] (Opsional) Tambah filter baru: `category_name`, `tipe_motor`, `kondisi_orisinalitas`, `source`, `seller_type`, `is_verified`
- [ ] Jangan tampilkan `min_discount_pct` dan `discount_pct` dulu
- [ ] Update tipe TypeScript response
- [ ] Kalau menampilkan `status`, siapkan tampilan untuk `sold`

---

## 9. Catatan untuk diskusi tim

Dua hal yang **belum diputuskan** dan mungkin memengaruhi frontend:

1. **Listing `sold` masih muncul di katalog.** Default API tidak memfilter `status`. Saat ini semua listing `active` jadi belum terasa, tapi begitu seller mulai menandai barang terjual, listing tersebut tetap tampil. Sementara ini frontend bisa kirim `?status=active`. Keputusan apakah backend harus default ke `active` masih terbuka.

2. **Listing buatan seller belum muncul di katalog.** Listing dari `POST /api/v1/listings` masuk ke tabel `listings`, sementara katalog membaca tabel taxonomy yang diisi pipeline eksternal. Jadi listing baru dari seller tidak langsung tampil di pencarian publik. Belum ada dampak (belum ada listing buatan seller), tapi perlu diselesaikan sebelum onboarding seller dibuka.
