import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="simple-page">
      <div className="container">
        <div className="simple-page-head">
          <h1>Halaman tidak ditemukan</h1>
          <p>Maaf, halaman yang kamu cari tidak tersedia atau sudah dipindahkan.</p>
          <div style={{ marginTop: 20 }}>
            <Link className="btn btn-primary" href="/">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
