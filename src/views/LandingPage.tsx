import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Bot,
  CheckCircle2,
  CreditCard,
  Fingerprint,
  Lock,
  PackageSearch,
  ShieldCheck,
  Sparkles,
  Store,
  TicketPercent,
  Wrench,
} from "lucide-react";
import type { Product, ProductCategory } from "../types/product";
import { categories } from "../data/categories";
import { dealers } from "../data/dealers";
import { featuredProductIds, getProduct, products } from "../data/products";
import { Button } from "../components/ui/Button";
import { StoreBadges } from "../components/ui/StoreBadges";
import { ProductGrid } from "../components/catalog/ProductGrid";

type LandingPageProps = {
  savedIds: string[];
  onExploreCatalog: (category?: ProductCategory, query?: string) => void;
  onOpenChat: () => void;
  onOpenProduct: (product: Product) => void;
  onToggleSave: (product: Product) => void;
  onOpenDealer: (dealerId: string) => void;
  onOpenInspeksi: () => void;
};

const heroProduct = getProduct("nmax-155-2022") ?? products[0];

const APP_FEATURES = [
  {
    icon: CreditCard,
    title: "Checkout & Pembayaran",
    desc: "VA, QRIS, e-wallet, dan COD dengan perlindungan transaksi penuh.",
  },
  {
    icon: Store,
    title: "Seller Center",
    desc: "Buka kios, kelola listing, dan cairkan saldo penjualanmu.",
  },
  {
    icon: PackageSearch,
    title: "Transaksi & Tracking",
    desc: "Pantau pesanan dan status pengiriman unit secara real-time.",
  },
  {
    icon: Bell,
    title: "Notifikasi Real-time",
    desc: "Update inspeksi, chat penjual, dan status pesanan langsung di HP.",
  },
  {
    icon: TicketPercent,
    title: "Voucher & Promo",
    desc: "Potongan harga dan promo inspeksi khusus member Apps.",
  },
  {
    icon: Fingerprint,
    title: "eKYC & Verifikasi",
    desc: "Akun terverifikasi untuk transaksi besar yang lebih aman.",
  },
];

export function LandingPage({
  savedIds,
  onExploreCatalog,
  onOpenChat,
  onOpenProduct,
  onToggleSave,
  onOpenDealer,
  onOpenInspeksi,
}: LandingPageProps) {
  const featured = featuredProductIds
    .map((id) => getProduct(id))
    .filter((p): p is Product => Boolean(p))
    .slice(0, 4);

  return (
    <>
      {/* ---------- Hero (centered) ---------- */}
      <section className="hero">
        <div className="container">
          <div className="hero-copy">
            <h1 className="hero-title">
              Beli, jual & cek motor dengan <em>lebih yakin</em>.
            </h1>
            <p className="hero-sub">
              Temukan motor baru, bekas, aksesoris, dan sparepart dari seller
              terkurasi. Bandingkan produk, tanya Montir AI, chat penjual, dan
              ajukan inspeksi sebelum mengambil keputusan.
            </p>
            <div className="hero-ctas">
              <Button size="lg" onClick={() => onExploreCatalog()}>
                Jelajah Pasar
                <ArrowRight size={18} />
              </Button>
            </div>
            <div className="hero-trust">
              <span>
                <BadgeCheck size={16} />
                Seller terverifikasi
              </span>
              <span>
                <Wrench size={15} />
                Jasa inspeksi montir
              </span>
              <span>
                <Bot size={16} />
                AI-assisted buying
              </span>
            </div>
          </div>

          <div className="hero-showcase" aria-hidden="true">
            <div className="hero-card-main">
              <img src={heroProduct.image} alt="" />
              <div className="hero-card-main-body">
                <h3>{heroProduct.title}</h3>
                <div className="hero-card-price">{heroProduct.price}</div>
                <div className="hero-card-meta">
                  <span>{heroProduct.location}</span>
                  <span>{heroProduct.year}</span>
                  <span>{heroProduct.mileage}</span>
                </div>
              </div>
            </div>

            <div className="hero-card-badge">
              <span className="hero-card-badge-icon">
                <CheckCircle2 size={16} />
              </span>
              Lolos inspeksi montir
            </div>

            <div className="hero-card-chat">
              <div className="hero-card-chat-head">
                <img src="/brand/montir-ai-logo.png" alt="" />
                <div>
                  <strong>Montir AI</strong>
                  <small>Asisten servis & rekomendasi</small>
                </div>
              </div>
              <div className="hero-chat-bubble user">
                Motor matic 30 jutaan yang aman buat harian?
              </div>
              <div className="hero-chat-bubble">
                NMAX 155 2022 ini menarik — km rendah, servis rutin. Cek CVT &
                histori servis sebelum nego ya.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Kategori ---------- */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="section-kicker">
                <Sparkles size={13} />
                Kategori
              </span>
              <h2 className="section-title">Mulai dari yang kamu butuhkan</h2>
            </div>
          </div>
          <div className="category-grid">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className="category-card"
                onClick={() => onExploreCatalog(cat.id)}
              >
                <img src={cat.image} alt="" />
                <span className="category-card-body">
                  <h3>{cat.label}</h3>
                  <p>{cat.description}</p>
                  <span>
                    Jelajahi {cat.label}
                    <ArrowRight size={14} />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Featured ---------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <span className="section-kicker">
                <BadgeCheck size={13} />
                Pilihan terkurasi
              </span>
              <h2 className="section-title">Unit pilihan minggu ini</h2>
              <p className="section-sub">
                Dipilih dari seller terverifikasi dengan data produk lengkap dan
                harga wajar di pasaran.
              </p>
            </div>
            <Button variant="outline" onClick={() => onExploreCatalog()}>
              Lihat semua
              <ArrowRight size={16} />
            </Button>
          </div>
          <ProductGrid
            products={featured}
            savedIds={savedIds}
            onOpen={onOpenProduct}
            onToggleSave={onToggleSave}
            layout="row"
          />
        </div>
      </section>

      {/* ---------- Montir AI highlight ---------- */}
      <section className="section" style={{ paddingTop: 8 }}>
        <div className="container">
          <div className="ai-highlight">
            <div className="ai-highlight-copy">
              <span className="section-kicker">
                <Bot size={13} />
                Montir AI
              </span>
              <h2>Tanya Montir AI sebelum kamu nego.</h2>
              <p>
                Asisten yang paham motor: minta rekomendasi sesuai budget, cek
                risiko unit bekas, bandingkan pilihan, dan tahu kapan waktunya
                inspeksi.
              </p>
              <ul className="ai-highlight-points">
                <li>
                  <CheckCircle2 size={16} />
                  Rekomendasi unit sesuai budget dan kebutuhan harianmu
                </li>
                <li>
                  <CheckCircle2 size={16} />
                  Checklist risiko sebelum bertemu penjual
                </li>
                <li>
                  <CheckCircle2 size={16} />
                  Saran kapan perlu pakai jasa inspeksi montir
                </li>
              </ul>
              <Button size="lg" onClick={onOpenChat}>
                <Sparkles size={17} />
                Mulai Tanya Montir
              </Button>
            </div>

            <div className="ai-demo" aria-hidden="true">
              <div className="ai-demo-head">
                <img src="/brand/montir-ai-logo.png" alt="" />
                <div>
                  <strong>Montir AI</strong>
                  <small>Asisten servis & rekomendasi motor</small>
                </div>
              </div>
              <div className="ai-demo-body">
                <div className="ai-demo-bubble user">
                  Rekomendasikan motor matic 30 jutaan
                </div>
                <div className="ai-demo-bubble">
                  Di kisaran 30 jutaan, tiga matic ini paling sering jadi
                  incaran — nyaman untuk harian dan harga jualnya stabil.
                </div>
                <div className="ai-demo-product">
                  <img src={heroProduct.image} alt="" />
                  <div>
                    <strong>{heroProduct.title}</strong>
                    <span>{heroProduct.price}</span>
                  </div>
                </div>
                <div className="ai-demo-bubble user">Kapan perlu inspeksi?</div>
                <div className="ai-demo-bubble">
                  Saat kamu sudah cocok dengan unit dan mau nego serius — montir
                  bantu cek mesin, rangka, CVT, dan dokumen.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Value props ---------- */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="section-kicker">
                <ShieldCheck size={13} />
                Why PasarMotor
              </span>
              <h2 className="section-title">
                Untuk buyer yang ingin lebih yakin. Untuk seller yang ingin
                lebih dipercaya.
              </h2>
            </div>
          </div>
          <div className="value-grid">
            <div className="value-card">
              <div className="value-card-icon">
                <ShieldCheck size={22} />
              </div>
              <h3>Aman sejak awal</h3>
              <p>
                Identitas seller dijaga, badge verifikasi jelas, dan alur
                jual-beli dirancang meminimalkan risiko penipuan.
              </p>
            </div>
            <div className="value-card">
              <div className="value-card-icon">
                <BadgeCheck size={22} />
              </div>
              <h3>Pasar terkurasi</h3>
              <p>
                Motor baru & bekas, sparepart, dan aksesoris dari dealer
                terkurasi dengan data produk yang rapi dan lengkap.
              </p>
            </div>
            <div className="value-card">
              <div className="value-card-icon">
                <Wrench size={22} />
              </div>
              <h3>Inspeksi montir</h3>
              <p>
                Validasi kondisi mesin, rangka, CVT, kelistrikan, dan dokumen
                oleh montir profesional sebelum kamu bayar.
              </p>
            </div>
            <div className="value-card">
              <div className="value-card-icon">
                <Bot size={22} />
              </div>
              <h3>AI-assisted buying</h3>
              <p>
                Montir AI bantu rekomendasi, cek risiko, dan bandingkan unit —
                dari riset awal sampai keputusan akhir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Inspeksi ---------- */}
      <section className="section" style={{ paddingTop: 8 }}>
        <div className="container inspeksi-section">
          <div>
            <span className="section-kicker">
              <Wrench size={13} />
              Jasa Inspeksi
            </span>
            <h2 className="section-title">
              Ajukan inspeksi saat kamu sudah cocok dengan unit.
            </h2>
            <p className="section-sub">
              Montir profesional datang mengecek unit incaranmu dan memberikan
              laporan lengkap — supaya nego berbasis kondisi nyata, bukan
              perasaan.
            </p>
            <div className="inspeksi-scope">
              {[
                "Mesin & suara idle",
                "Rangka & bekas jatuh",
                "CVT & transmisi",
                "Kelistrikan & panel",
                "Kelengkapan dokumen",
                "Estimasi biaya perbaikan",
              ].map((item) => (
                <div className="inspeksi-scope-item" key={item}>
                  <CheckCircle2 size={16} />
                  {item}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 26 }}>
              <Button size="lg" onClick={onOpenInspeksi}>
                <Wrench size={17} />
                Ajukan Inspeksi
              </Button>
            </div>
          </div>
          <div className="inspeksi-visual">
            <img
              src="https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=1100&q=80"
              alt="Montir memeriksa motor"
            />
            <div className="inspeksi-visual-card">
              <div className="inspeksi-visual-card-icon">
                <CheckCircle2 size={21} />
              </div>
              <div>
                <strong>Laporan inspeksi siap</strong>
                <small>
                  52 titik pengecekan · estimasi perbaikan Rp. 480 ribu
                </small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Dealer trust ---------- */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="section-kicker">
                <BadgeCheck size={13} />
                Dealer terverifikasi
              </span>
              <h2 className="section-title">
                Dipercaya dealer & seller terkurasi
              </h2>
            </div>
          </div>
          <div className="trust-stats">
            <div className="trust-stat">
              <strong>120+</strong>
              <span>Dealer terverifikasi</span>
            </div>
            <div className="trust-stat">
              <strong>2.400+</strong>
              <span>Unit terkurasi tayang</span>
            </div>
            <div className="trust-stat">
              <strong>900+</strong>
              <span>Inspeksi selesai</span>
            </div>
            <div className="trust-stat">
              <strong>4.8</strong>
              <span>Rating kepuasan buyer</span>
            </div>
          </div>
          <div className="dealer-strip">
            {dealers.slice(0, 4).map((dealer) => (
              <button
                key={dealer.id}
                className="dealer-chip"
                onClick={() => onOpenDealer(dealer.id)}
              >
                <span className="dealer-chip-avatar">{dealer.initials}</span>
                <span>
                  <strong>
                    {dealer.name}
                    {dealer.verified && <BadgeCheck size={14} />}
                  </strong>
                  <small>{dealer.location}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- App-exclusive capabilities ---------- */}
      <section className="section" style={{ paddingTop: 8 }}>
        <div className="container">
          <div className="app-exclusive">
            <div className="app-exclusive-head">
              <span className="section-kicker">
                <Lock size={13} />
                Eksklusif di Apps
              </span>
              <h2 className="section-title">
                Website untuk riset. Transaksinya di Apps.
              </h2>
              <p className="section-sub" style={{ marginInline: "auto" }}>
                Di web kamu bisa menjelajah, bertanya, dan menyimpan incaran.
                Begitu siap bertransaksi, semua kemampuan penuh PasarMotor
                menunggu di Apps.
              </p>
            </div>

            <div className="app-feature-grid">
              {APP_FEATURES.map((feature, i) => (
                <div
                  className="app-feature-card"
                  key={feature.title}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <span className="app-feature-lock">
                    <Lock size={11} />
                    Apps
                  </span>
                  <div className="app-feature-icon">
                    <feature.icon size={20} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                </div>
              ))}
            </div>

            <StoreBadges />
          </div>
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="section" style={{ paddingTop: 8 }}>
        <div className="container">
          <div className="final-cta">
            <h2>Siap mulai cari motor dengan lebih yakin?</h2>
            <p>
              Jelajahi pasar motor, aksesoris, dan sparepart, lalu gunakan
              Montir AI dan jasa inspeksi untuk membantu keputusan jual-belimu.
            </p>
            <div className="final-cta-actions">
              <Button size="lg" onClick={() => onExploreCatalog()}>
                Mulai Jelajah
                <ArrowRight size={18} />
              </Button>
            </div>
            <p className="final-cta-seller">
              Checkout, Seller Center, transaksi & tracking — hanya di Apps
              PasarMotor.
            </p>
            <StoreBadges onDark />
          </div>
        </div>
      </section>
    </>
  );
}
