import { useEffect, useState } from 'react';
import {
  BadgeCheck,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircle,
  Wrench,
} from 'lucide-react';
import type { Product } from '../types/product';
import { getDealer } from '../data/dealers';
import { products } from '../data/products';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProductGrid } from '../components/catalog/ProductGrid';

type ProductDetailPageProps = {
  product: Product;
  savedIds: string[];
  onBackToCatalog: () => void;
  onOpenProduct: (product: Product) => void;
  onToggleSave: (product: Product) => void;
  onRequestInspeksi: (product: Product) => void;
  onContactSeller: (product: Product) => void;
  onOpenDealer: (dealerId: string) => void;
};

export function ProductDetailPage({
  product,
  savedIds,
  onBackToCatalog,
  onOpenProduct,
  onToggleSave,
  onRequestInspeksi,
  onContactSeller,
  onOpenDealer,
}: ProductDetailPageProps) {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const dealer = getDealer(product.seller);
  const saved = savedIds.includes(product.id);
  const isMotor = product.category === 'motor';

  useEffect(() => {
    setGalleryIndex(0);
    window.scrollTo({ top: 0 });
  }, [product.id]);

  const gallery = product.gallery.length > 0 ? product.gallery : [product.image];
  const similar = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const step = (dir: 1 | -1) => {
    setGalleryIndex((i) => (i + dir + gallery.length) % gallery.length);
  };

  // Sama seperti mobile app: detail bervariasi (tahun, KM, cc) hidup di dalam
  // deskripsi — bukan card khusus — karena data listing bisa tidak lengkap.
  const conditionLabel = /Bekas/i.test(product.tag) ? 'Bekas' : 'Baru';
  const updatedLabel = 'Kemarin';
  const productDescription = isMotor
    ? `${product.title} tahun ${product.year} dengan pemakaian ${product.mileage}${
        product.cc ? ` dan mesin ${product.cc} cc` : ''
      }. Kondisi terawat, kelengkapan surat aman, dan siap pakai harian. Bisa cek kondisi lebih detail lewat Montir AI atau ajukan inspeksi sebelum transaksi.`
    : `${product.title} kondisi ${conditionLabel.toLowerCase()} dan siap pakai sesuai deskripsi. Kompatibilitas serta detail produk bisa dikonsultasikan dulu lewat Montir AI sebelum membeli.`;
  const productSpecs = [
    { label: 'Kondisi', value: conditionLabel },
    { label: 'Kategori', value: product.tag },
  ];

  return (
    <div className="pdp-page">
      <div className="container">
        <div className="pdp-breadcrumb">
          <button onClick={onBackToCatalog}>Pasar</button>
          <ChevronRight size={14} />
          <strong>{product.title}</strong>
        </div>

        <div className="pdp-grid">
          {/* Gallery */}
          <div>
            <div className="pdp-gallery-main">
              <img src={gallery[galleryIndex]} alt={product.title} />
              <div className="pdp-photo-count">
                {galleryIndex + 1} / {gallery.length}
              </div>
              {gallery.length > 1 && (
                <>
                  <button
                    className="pdp-gallery-nav prev"
                    onClick={() => step(-1)}
                    aria-label="Foto sebelumnya"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    className="pdp-gallery-nav next"
                    onClick={() => step(1)}
                    aria-label="Foto berikutnya"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="pdp-thumbs">
                {gallery.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    className={`pdp-thumb ${i === galleryIndex ? 'active' : ''}`}
                    onClick={() => setGalleryIndex(i)}
                    aria-label={`Foto ${i + 1}`}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info — struktur mengikuti PDP mobile app */}
          <div className="pdp-info">
            <div className="pdp-meta-row">
              <Badge tone={product.tag === 'Motor Baru' ? 'red' : 'dark'}>
                {product.tag}
              </Badge>
              <span className="pdp-updated">
                <Clock3 size={12} strokeWidth={2.4} />
                {updatedLabel}
              </span>
            </div>
            <h1 className="pdp-title">{product.title}</h1>
            <p className="pdp-location">
              <MapPin size={14} />
              {product.location}
            </p>

            <div className="pdp-price-card">
              <span className="pdp-price-label">Harga</span>
              <div className="pdp-price">{product.price}</div>
              <p className="pdp-price-note">
                {isMotor
                  ? 'Bisa inspeksi dan test ride — tanya unit ini ke Montir AI lewat chat di bawah.'
                  : 'Bisa cek kompatibilitas dan diskusi kondisi — tanya Montir AI lewat chat di bawah.'}
              </p>
              <div className="pdp-ctas">
                <Button
                  variant={saved ? 'soft' : 'outline'}
                  style={!isMotor ? { gridColumn: '1 / -1' } : undefined}
                  onClick={() => onToggleSave(product)}
                >
                  <Bookmark size={16} {...(saved ? { fill: 'currentColor' } : {})} />
                  {saved ? 'Tersimpan' : 'Simpan'}
                </Button>
                {isMotor && (
                  <Button variant="outline" onClick={() => onRequestInspeksi(product)}>
                    <Wrench size={16} />
                    Ajukan Inspeksi
                  </Button>
                )}
                <Button
                  variant="dark"
                  style={{ gridColumn: '1 / -1' }}
                  onClick={() => onContactSeller(product)}
                >
                  <MessageCircle size={17} />
                  Hubungi Penjual
                </Button>
              </div>
            </div>

            <div className="pdp-desc">
              <h3>Deskripsi</h3>
              <p>{productDescription}</p>
            </div>

            <div className="pdp-desc">
              <h3>Spesifikasi</h3>
              <div className="pdp-spec-table">
                {productSpecs.map((spec) => (
                  <div className="pdp-spec-row" key={spec.label}>
                    <span>{spec.label}</span>
                    <strong>{spec.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            {dealer && (
              <div className="pdp-dealer-card">
                <div className="pdp-dealer-avatar">{dealer.initials}</div>
                <div className="pdp-dealer-info">
                  <strong>
                    {dealer.name}
                    {dealer.verified && <BadgeCheck size={15} />}
                    {dealer.verified && <Badge tone="red">Terkurasi</Badge>}
                  </strong>
                  <small>
                    Identitas dealer terverifikasi · {dealer.responseTime}
                  </small>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenDealer(dealer.id)}
                >
                  Lihat profil
                </Button>
              </div>
            )}
          </div>
        </div>

        {similar.length > 0 && (
          <div className="pdp-section">
            <h2>Produk serupa</h2>
            <ProductGrid
              products={similar}
              savedIds={savedIds}
              onOpen={onOpenProduct}
              onToggleSave={onToggleSave}
              columns={4}
            />
          </div>
        )}
      </div>
    </div>
  );
}
