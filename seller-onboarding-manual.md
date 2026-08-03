# Pendaftaran Manual Penjual (SSO + Form)

Panduan implementasi halaman **"Pendaftaran Manual Penjual"** — form onboarding seller yang
sebelumnya cuma bisa lewat SSO polos, sekarang dilengkapi form detail kios, tapi identitasnya
(nama & email) tetap datang dari **Google SSO**, bukan diketik manual. Untuk envelope response,
error format, dan detail lengkap tiap endpoint, lihat [`docs/api.md`](./api.md).

---

## 1. Kenapa tetap pakai SSO di form manual?

Endpoint `POST /api/v1/seller/onboard` selalu jalan di belakang JWT — dia **mengisi detail kios
untuk user yang sudah login**, bukan mendaftarkan akun baru dari form. Jadi "pendaftaran manual"
di sini artinya: manual untuk detail bisnis/kios, tapi identitas user tetap dari Google supaya:

- Tidak ada akun ganda / email yang tidak terverifikasi.
- Nama & email di kios selalu konsisten dengan akun yang benar-benar dipakai login nanti.

Alur singkatnya:

```
1. User klik "Sign in with Google" di halaman form
2. Dapat id_token dari Google → tukar ke JWT PasarMotor (POST /auth/google/mobile)
3. GET /api/v1/me → prefill & kunci field Nama + Email dari profil Google
4. User isi sisa field kios (nomor telepon, nama kios, lokasi, dst) + upload logo
5. Submit semua field kios sebagai multipart/form-data ke POST /api/v1/seller/onboard
   (dengan Authorization: Bearer <jwt> dari langkah 2)
```

Tidak ada endpoint baru untuk auth — semua langkah di atas pakai endpoint yang sudah ada.

---

## 2. Langkah 1–2: Sign-in Google di halaman form (web)

Endpoint `POST /auth/google/mobile` namanya "mobile" tapi verifikasinya generik (cek ID token ke
Google, bukan spesifik Android) — jadi aman dipakai dari web juga, asal id_token-nya berasal dari
client ID yang terdaftar di `GOOGLE_CLIENT_ID` (client ID web).

Pakai [Google Identity Services](https://developers.google.com/identity/gsi/web) di halaman form
untuk dapat id_token tanpa redirect penuh (user tidak perlu pindah halaman/kehilangan progress form):

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
<div id="g_id_onload"
     data-client_id="<GOOGLE_CLIENT_ID>"
     data-callback="handleGoogleSignIn">
</div>
<div class="g_id_signin"></div>
```

```ts
async function handleGoogleSignIn(response: { credential: string }) {
  const res = await fetch(`${BACKEND}/auth/google/mobile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_token: response.credential }),
  })
  const { data } = await res.json()
  localStorage.setItem('token', data.token) // JWT PasarMotor, bukan token Google

  await prefillFromGoogle(data.token)
}
```

> Kalau app mobile (Android/iOS) yang butuh halaman ini juga, flow-nya identik — cuma id_token-nya
> datang dari Google Sign-In SDK native, bukan GSI web widget. Lihat §"Alur Google Sign-In —
> Android" di [`docs/api.md`](./api.md).

**Error yang perlu di-handle:**

| Status | Kapan terjadi | Saran UI |
|---|---|---|
| `400` | `id_token` kosong/tidak dikirim | Jangan biarkan submit tanpa sign-in dulu |
| `401` | Token invalid/expired, atau `aud` bukan client ID yang terdaftar | Tampilkan tombol sign-in ulang |

---

## 3. Langkah 3: Prefill & kunci Nama + Email

```ts
async function prefillFromGoogle(token: string) {
  const res = await fetch(`${BACKEND}/api/v1/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const { data } = await res.json()

  form.setValue('name', data.user.full_name)   // field "Nama" — read-only
  form.setValue('email', data.user.email)       // field "Email" — read-only
}
```

**Field Nama & Email di mockup dikunci (read-only)** setelah sign-in — user tidak mengetik ulang,
supaya kios selalu terikat ke akun Google yang benar. Kalau `data.seller` di response ini sudah
terisi (bukan `null`), artinya user ini **sudah pernah onboarding** — jangan tampilkan form lagi,
arahkan ke Seller Center (submit ulang akan dapat `400 shop already set up`).

---

## 4. Langkah 4–5: Sisa form + submit

Field di mockup dan mapping ke API:

| Field di mockup | Field API | Wajib | Catatan |
|---|---|---|---|
| Nama | — | — | Dari Google, bukan dikirim ke onboard |
| Email | — | — | Dari Google, bukan dikirim ke onboard |
| Nomor Telepon | `phone` | **Ya** | |
| Nama Kios | `name` | **Ya** | Ini "nama seller/toko", beda dari Nama user di atas |
| Lokasi Kios | `full_address` | Tidak | |
| Kota / Kabupaten | `city` | Tidak | |
| Area Pengambilan | `area_pickup` | Tidak | |
| Keterangan Toko / Deskripsi | `description` | Tidak | |
| Logo / Ikon | `logo` (file) | Tidak | Max 8MB. Kalau tidak diupload, kios fallback ke inisial teks (`logo_initial`, opsional, tidak ada di mockup ini) |
| Tautan Tokopedia | `tokopedia_url` | Tidak | String bebas, **tidak divalidasi backend** — validasi format URL di frontend kalau mau |
| Tautan OLX | `olx_url` | Tidak | Sama seperti di atas |
| Province (tidak ada di mockup) | `province` | Tidak | Boleh dikirim kalau nanti ditambahkan ke form |

Karena ada file upload, kirim sebagai `multipart/form-data`, bukan JSON:

```ts
async function submitOnboarding(token: string, values: FormValues, logoFile?: File) {
  const form = new FormData()
  form.set('phone', values.phone)
  form.set('name', values.kioskName)          // "Nama Kios"
  form.set('full_address', values.location)   // "Lokasi Kios"
  form.set('city', values.city)
  form.set('area_pickup', values.pickupArea)
  form.set('description', values.description)
  if (values.tokopediaUrl) form.set('tokopedia_url', values.tokopediaUrl)
  if (values.olxUrl) form.set('olx_url', values.olxUrl)
  if (logoFile) form.set('logo', logoFile)

  const res = await fetch(`${BACKEND}/api/v1/seller/onboard`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }, // JANGAN set Content-Type manual — browser yang isi boundary-nya
    body: form,
  })

  if (!res.ok) {
    const err = await res.json()
    // err.errors[0].detail: "shop already set up" (400), dll — lihat tabel error di bawah
    throw new Error(err.errors?.[0]?.detail ?? 'Gagal mendaftar')
  }

  const { data } = await res.json()
  return data // seller yang baru dibuat, termasuk logo_url hasil upload
}
```

**Response `201`** — lihat contoh lengkap di [`docs/api.md` §`POST /api/v1/seller/onboard`](./api.md).
Field opsional yang tidak diisi (termasuk `tokopedia_url`, `olx_url`, `logo_url`) di-omit dari
JSON, bukan `null` — cek dengan optional chaining.

**Error yang perlu di-handle:**

| Status | Kapan terjadi | Saran UI |
|---|---|---|
| `401` | Token tidak ada/invalid/expired | Balik ke langkah sign-in |
| `400` | Body tidak valid, atau user sudah onboarding sebelumnya (`shop already set up`) | Kalau sudah onboarding, redirect ke Seller Center alih-alih tampil error |
| `500` | Upload logo gagal / DB error | Tampilkan retry — form values tetap dipertahankan di state, jangan reset |

---

## 5. Ringkasan urutan panggilan API

```
1. (Google Identity Services widget, tidak ada network call ke backend)
2. POST /auth/google/mobile        { id_token }              → { token }
3. GET  /api/v1/me                 Authorization: Bearer      → { user, seller }
      → kalau seller != null: sudah onboarding, jangan tampilkan form
      → prefill+kunci Nama & Email dari user.full_name / user.email
4. POST /api/v1/seller/onboard     Authorization: Bearer, multipart/form-data
      → { seller baru, termasuk logo_url kalau ada file }
```

Tidak ada endpoint baru yang perlu dibuat backend untuk flow ini — ketiga endpoint di atas sudah
ada. Yang baru hanya field tambahan di `POST /api/v1/seller/onboard`: `tokopedia_url`, `olx_url`,
dan dukungan upload file `logo` (lihat [`docs/api.md`](./api.md) untuk detail lengkap tiap field).
