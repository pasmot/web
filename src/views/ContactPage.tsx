'use client';

import Link from 'next/link';
import { AlertTriangle, Clock, Mail, MapPin, MessageCircle, ShieldCheck } from 'lucide-react';
import { COMPANY } from '../data/company';
import { buildWhatsAppUrl } from '../lib/contact';

const WA_MESSAGE =
  'Halo PASARMOTOR Care, saya butuh bantuan terkait akun/transaksi saya.';

export function ContactPage() {
  return (
    <div className="contact-page">
      <div className="container">
        <header className="contact-head">
          <h1>Hubungi Kami</h1>
          <p>
            Ada kendala transaksi, pertanyaan soal akun, atau menemukan hal yang
            mencurigakan? Tim PASARMOTOR Care siap membantu.
          </p>
        </header>

        <div className="contact-grid">
          <a
            className="contact-card"
            href={buildWhatsAppUrl(WA_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="contact-icon wa">
              <MessageCircle size={20} />
            </span>
            <strong>WhatsApp PASARMOTOR Care</strong>
            <span className="contact-value">{COMPANY.phoneDisplay}</span>
            <span className="contact-note">Jalur tercepat untuk kendala transaksi.</span>
          </a>

          <a className="contact-card" href={`mailto:${COMPANY.emailSupport}`}>
            <span className="contact-icon">
              <Mail size={20} />
            </span>
            <strong>Email Layanan Pengguna</strong>
            <span className="contact-value">{COMPANY.emailSupport}</span>
            <span className="contact-note">
              Untuk pertanyaan umum, kerja sama, dan laporan tertulis.
            </span>
          </a>

          <a className="contact-card" href={`mailto:${COMPANY.emailPrivacy}`}>
            <span className="contact-icon">
              <ShieldCheck size={20} />
            </span>
            <strong>Data Pribadi &amp; Privasi</strong>
            <span className="contact-value">{COMPANY.emailPrivacy}</span>
            <span className="contact-note">
              Permohonan hak subjek data ditangani DPO kami, {COMPANY.dpoName}.
            </span>
          </a>

          <div className="contact-card static">
            <span className="contact-icon">
              <Clock size={20} />
            </span>
            <strong>Jam Operasional</strong>
            <span className="contact-value">{COMPANY.supportHours}</span>
            <span className="contact-note">
              Di luar jam tersebut, pesan tetap masuk dan dibalas pada hari kerja
              berikutnya.
            </span>
          </div>
        </div>

        <section className="contact-warning">
          <span className="contact-warning-icon">
            <AlertTriangle size={18} />
          </span>
          <div>
            <h2>Waspada penipuan mengatasnamakan PASARMOTOR</h2>
            <p>
              Kami <strong>tidak pernah</strong> meminta kata sandi, kode OTP, PIN, atau
              data kartu pembayaran melalui saluran apa pun. Kami juga tidak pernah
              menghubungi kamu dari nomor pribadi untuk meminta transfer ke rekening
              selain Rekening Escrow Resmi. Pelajari cirinya di{' '}
              <Link href="/bantuan/rekening-resmi">panduan rekening resmi</Link>.
            </p>
          </div>
        </section>

        <section className="contact-office">
          <span className="contact-icon">
            <MapPin size={20} />
          </span>
          <div>
            <h2>{COMPANY.legalName}</h2>
            <p>{COMPANY.address}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
