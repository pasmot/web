import type { ReactNode } from 'react';
import Link from 'next/link';
import { Apple, Play } from 'lucide-react';
import type { AppView } from '../../types/app';
import { COMPANY } from '../../data/company';

type FooterProps = {
  onNavigate: (view: AppView) => void;
};

/** Tombol unduh aplikasi — mati sampai URL toko diisi di data/company.ts. */
function AppButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  if (!href) {
    return (
      <span className="footer-app-btn" aria-label={`${label} — segera hadir`} aria-disabled>
        {children}
      </span>
    );
  }

  return (
    <a className="footer-app-btn" href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              {/* Lockup horizontal versi putih — wordmark-nya sudah bagian dari
                  logo, jadi tidak ditulis ulang sebagai teks. */}
              <img src="/brand/pm-logo-horizontal-white.svg" alt="PasarMotor" />
            </div>
            <p className="footer-desc">
              Marketplace motor dengan seller terverifikasi, Montir AI, dan jasa
              inspeksi.
            </p>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li>
                <button onClick={() => onNavigate('catalog')}>Pasar</button>
              </li>
              <li>
                <button onClick={() => onNavigate('chat')}>Montir AI</button>
              </li>
              <li>
                <button onClick={() => onNavigate('inspeksi')}>Jasa Inspeksi</button>
              </li>
              <li>
                <button onClick={() => onNavigate('saved')}>Incaran</button>
              </li>
              <li>
                <Link href="/registrasi-seller">Daftar Jadi Penjual</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Bantuan</h4>
            <ul>
              <li>
                <Link href="/bantuan">Pusat Bantuan</Link>
              </li>
              <li>
                <Link href="/kebijakan-privasi">Kebijakan Privasi</Link>
              </li>
              <li>
                <Link href="/syarat-ketentuan">Syarat &amp; Ketentuan</Link>
              </li>
              <li>
                <Link href="/hubungi-kami">Hubungi Kami</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Download Apps</h4>
            <div className="footer-apps">
              <AppButton href={COMPANY.appStoreUrl} label="App Store">
                <Apple size={22} />
                <span>
                  <small>Download di</small>
                  <strong>App Store</strong>
                </span>
              </AppButton>
              <AppButton href={COMPANY.playStoreUrl} label="Google Play">
                <Play size={20} />
                <span>
                  <small>Dapatkan di</small>
                  <strong>Google Play</strong>
                </span>
              </AppButton>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 {COMPANY.legalName}. Seluruh hak cipta dilindungi.</span>
          <span>Jual-beli &amp; transaksi penuh tersedia di Apps PasarMotor.</span>
        </div>
      </div>
    </footer>
  );
}
