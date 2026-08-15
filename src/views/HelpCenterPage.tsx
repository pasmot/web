"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  CreditCard,
  Landmark,
  MessageCircle,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { FAQ_TOPICS } from "../data/help/faq";
import { COMPANY } from "../data/company";

const GUIDES = [
  {
    href: "/bantuan/rekening-resmi",
    icon: Landmark,
    title: "Rekening Escrow Resmi",
    desc: "Cara memastikan kamu transfer ke rekening yang benar — dan ciri penipuan.",
  },
  {
    href: "/bantuan/biaya-layanan",
    icon: CreditCard,
    title: "Biaya Layanan",
    desc: "Rincian biaya jual-beli, apa yang gratis, dan apa yang di luar tanggungan kami.",
  },
  {
    href: "/bantuan/kebijakan-tanda-jadi",
    icon: Ticket,
    title: "Kebijakan Tanda Jadi",
    desc: "Aturan booking fee: kapan dikembalikan penuh dan kapan bisa hangus.",
  },
  {
    href: "/bantuan/hak-data-pribadi",
    icon: ShieldCheck,
    title: "Hak atas Data Pribadi",
    desc: "Cara mengajukan akses, perbaikan, atau penghapusan data kamu.",
  },
];

export function HelpCenterPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="help-page">
      <div className="container">
        <header className="help-head">
          <h1>Pusat Bantuan</h1>
          <p>
            Jawaban singkat untuk pertanyaan yang paling sering muncul soal
            jual-beli motor di PASARMOTOR. Tidak ketemu? Tim PasarMotor Care
            siap bantu.
          </p>
        </header>

        <section className="help-guides" aria-label="Panduan penting">
          {GUIDES.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="help-guide-card"
            >
              <span className="help-guide-icon">
                <guide.icon size={18} />
              </span>
              <strong>{guide.title}</strong>
              <span className="help-guide-desc">{guide.desc}</span>
            </Link>
          ))}
        </section>

        <div className="help-layout">
          <div className="help-topics">
            {FAQ_TOPICS.map((topic) => (
              <section key={topic.id} className="help-topic" id={topic.id}>
                <h2>{topic.title}</h2>
                <p className="help-topic-blurb">{topic.blurb}</p>

                <ul className="help-faq">
                  {topic.items.map((item, index) => {
                    const id = `${topic.id}-${index}`;
                    const open = openId === id;
                    return (
                      <li
                        key={id}
                        className={`help-faq-item ${open ? "open" : ""}`}
                      >
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => setOpenId(open ? null : id)}
                        >
                          <span>{item.q}</span>
                          <ChevronDown size={18} />
                        </button>
                        {open && <p>{item.a}</p>}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>

          <aside className="help-aside">
            <div className="help-contact-card">
              <span className="help-contact-icon">
                <MessageCircle size={18} />
              </span>
              <h2>Masih butuh bantuan?</h2>
              <p>
                Hubungi PasarMotor Care — {COMPANY.supportHours}. Kami tidak
                pernah meminta kata sandi, kode OTP, atau data kartu pembayaran.
              </p>
              <Link className="btn btn-primary btn-block" href="/hubungi-kami">
                Hubungi Kami
              </Link>
            </div>

            <div className="help-links-card">
              <h2>Dokumen Resmi</h2>
              <ul>
                <li>
                  <Link href="/syarat-ketentuan">Syarat &amp; Ketentuan</Link>
                </li>
                <li>
                  <Link href="/kebijakan-privasi">Kebijakan Privasi</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
