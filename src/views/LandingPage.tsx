import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Bot,
  CheckCircle2,
  CreditCard,
  Lock,
  PackageSearch,
  ShieldCheck,
  Sparkles,
  Store,
  TicketPercent,
  Wrench,
} from "lucide-react";
import type { Product } from "../types/product";
import { categoryMeta, categoryCardRank } from "../data/categories";
import { useCategories } from "../hooks/useCategories";
import { useFeaturedListings } from "../hooks/useFeaturedListings";
import { featuredProductIds, getProduct } from "../data/products";
import { Button } from "../components/ui/Button";
import { StoreBadges } from "../components/ui/StoreBadges";
import { ProductGrid } from "../components/catalog/ProductGrid";

type LandingPageProps = {
  savedIds: string[];
  onExploreCatalog: (categorySlug?: string, query?: string) => void;
  onOpenChat: () => void;
  onOpenProduct: (product: Product) => void;
  onToggleSave: (product: Product) => void;
};

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
];

const VALUE_PROPS = [
  {
    icon: ShieldCheck,
    title: "Aman sejak awal",
    desc: "Identitas seller dijaga, badge verifikasi jelas, dan alur jual-beli dirancang meminimalkan risiko penipuan.",
  },
  {
    icon: BadgeCheck,
    title: "Pasar terkurasi",
    desc: "Motor baru & bekas, sparepart, dan aksesoris dari dealer terkurasi dengan data produk yang rapi dan lengkap.",
  },
  {
    icon: Wrench,
    title: "Inspeksi montir",
    desc: "Validasi kondisi mesin, rangka, CVT, kelistrikan, dan dokumen oleh montir profesional sebelum kamu bayar.",
  },
  {
    icon: Bot,
    title: "Montir AI",
    desc: "Montir AI bantu rekomendasi, cek risiko, dan bandingkan unit — dari riset awal sampai keputusan akhir.",
  },
];

export function LandingPage({
  savedIds,
  onExploreCatalog,
  onOpenChat,
  onOpenProduct,
  onToggleSave,
}: LandingPageProps) {
  const { categories } = useCategories();

  // "Unit pilihan minggu ini" comes from the live motor catalog; fall back to
  // the static picks if the API returns nothing (so the section stays filled).
  const { products: fetchedFeatured, loading: featuredLoading } =
    useFeaturedListings(4);
  const staticFeatured = featuredProductIds
    .map((id) => getProduct(id))
    .filter((p): p is Product => Boolean(p))
    .slice(0, 4);
  const featured =
    fetchedFeatured.length > 0 ? fetchedFeatured : staticFeatured;

  return (
    <>
      {/* ---------- Hero (centered, app showcase) ---------- */}
      <section className="hero">
        <div className="container">
          <div className="hero-copy">
            <h1 className="hero-title">
              Motor, Sparepart, Aksesoris.
              <br />
              Beli & Jual <em>lebih yakin.</em>
            </h1>
            <p className="hero-sub">
              Temukan motor, aksesoris, dan sparepart baru maupun bekas dari
              seller terverifikasi dengan rekomendasi cerdas dari Montir AI.
            </p>
            <div className="hero-ctas">
              <Button size="lg" onClick={() => onExploreCatalog()}>
                Jelajah
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>

          <div className="hero-showcase">
            <img
              className="hero-phone hero-phone-left"
              src="/image1.png"
              alt=""
              aria-hidden="true"
            />
            <img
              className="hero-phone hero-phone-right"
              src="/image2.png"
              alt=""
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      {/* ---------- Kategori ---------- */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Mulai dari yang kamu butuhkan</h2>
          </div>
          <div className="category-grid">
            {[...categories]
              .sort(
                (a, b) => categoryCardRank(a.slug) - categoryCardRank(b.slug),
              )
              .map((cat) => {
                const meta = categoryMeta(cat.slug, cat.name);
                return (
                  <button
                    key={cat.slug}
                    className="category-card"
                    onClick={() => onExploreCatalog(cat.slug)}
                  >
                    <img src={meta.image} alt="" />
                    <span className="category-card-body">
                      <h3>{meta.name}</h3>
                      <p>{meta.description}</p>
                      <span>
                        Jelajahi {meta.name}
                        <ArrowRight size={14} />
                      </span>
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      </section>

      {/* ---------- Featured ---------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
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
            loading={featuredLoading && featured.length === 0}
            layout="row"
          />
        </div>
      </section>

      {/* ---------- Montir AI highlight ---------- */}
      <section className="section" style={{ paddingTop: 8 }}>
        <div className="container">
          <div className="ai-highlight">
            <div className="ai-highlight-copy">
              <h2>
                Tanya Montir AI
                <br />
                Sebelum kamu nego.
              </h2>
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

            <div className="ai-visual" aria-hidden="true">
              <img className="ai-visual-back" src="/image3.png" alt="" />
              <img className="ai-visual-front" src="/image4.png" alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Value props ---------- */}
      <section className="section">
        <div className="container value-section">
          <h2 className="value-heading">
            Untuk <em>buyer</em> yang ingin lebih yakin. Untuk <em>seller</em>{" "}
            yang ingin lebih dipercaya.
          </h2>
          <div className="value-grid">
            {VALUE_PROPS.map((item) => (
              <div className="value-card" key={item.title}>
                <div className="value-card-icon">
                  <item.icon size={22} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- App-exclusive capabilities ---------- */}
      <section className="section" style={{ paddingTop: 8 }}>
        <div className="container">
          <div className="app-exclusive">
            <div className="app-exclusive-head">
              <h2 className="section-title">
                Website untuk incar barang. Transaksinya di Apps.
              </h2>
              <p className="section-sub" style={{ marginInline: "auto" }}>
                Di web kamu bisa menjelajah, bertanya, dan menyimpan incaran.
                Begitu siap bertransaksi, semua kemampuan penuh PasarMotor
                menunggu di Apps.
              </p>
              <StoreBadges />
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
          </div>
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      {/* <section className="section" style={{ paddingTop: 8 }}>
        <div className="container">
          <div className="final-cta">
            <h2>
              Siap mulai cari motor, sparepart, & aksesoris dengan lebih yakin?
            </h2>
            <p>
              Jelajahi pasar motor, aksesoris, dan sparepart. Pake Montir AI dan
              jasa inspeksi untuk membantu keputusan jual-belimu.
            </p>
            <div className="final-cta-actions">
              <Button size="lg" onClick={() => onExploreCatalog()}>
                Mulai Jelajah
                <ArrowRight size={18} />
              </Button>
            </div>
            <StoreBadges />
          </div>
        </div>
      </section> */}
    </>
  );
}
