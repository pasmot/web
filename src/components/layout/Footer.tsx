import { Apple, Play } from 'lucide-react';
import type { AppView } from '../../types/app';

type FooterProps = {
  onNavigate: (view: AppView) => void;
};

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <img src="/PM - Logo_Final_White.svg" alt="PasarMotor" />
              <span>
                Pasar<em>Motor</em>
              </span>
            </div>
            <p className="footer-desc">
              Marketplace otomotif dengan pasar terkurasi, Montir AI, dan jasa
              inspeksi — supaya keputusan jual-beli motor terasa lebih aman dan jelas.
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
            </ul>
          </div>

          <div className="footer-col">
            <h4>Bantuan</h4>
            <ul>
              <li>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Pusat Bantuan
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Syarat & Ketentuan
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Hubungi Kami
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Download Apps</h4>
            <div className="footer-apps">
              <a className="footer-app-btn" href="#" onClick={(e) => e.preventDefault()}>
                <Apple size={22} />
                <span>
                  <small>Download di</small>
                  <strong>App Store</strong>
                </span>
              </a>
              <a className="footer-app-btn" href="#" onClick={(e) => e.preventDefault()}>
                <Play size={20} />
                <span>
                  <small>Dapatkan di</small>
                  <strong>Google Play</strong>
                </span>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 PasarMotor · Prototype UI — semua data bersifat mock.</span>
          <span>Jual-beli & transaksi penuh tersedia di Apps PasarMotor.</span>
        </div>
      </div>
    </footer>
  );
}
