"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/Button";
import { isEmailTaken, onboardSellerManual } from "../lib/api";
import { loginUrl } from "../lib/auth";

const MAX_LOGO_BYTES = 5 * 1024 * 1024; // mockup: "PNG atau JPG • Maks 5MB"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Phase = "form" | "success";

type FormState = {
  name: string; // Nama pemilik (jalur manual: diketik sendiri)
  email: string;
  phone: string;
  kioskName: string;
  location: string;
  city: string;
  pickupArea: string;
  description: string;
  tokopediaUrl: string;
  olxUrl: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  kioskName: "",
  location: "",
  city: "",
  pickupArea: "",
  description: "",
  tokopediaUrl: "",
  olxUrl: "",
};

/** Light URL check — the backend does NOT validate these, so we do it here. */
function looksLikeUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function SellerRegistrationPage() {
  const { pushToast, navigate } = useApp();

  const [phase, setPhase] = useState<Phase>("form");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  // Backend menerima logo sebagai opsional; frontend yang mewajibkannya.
  const [logoError, setLogoError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set on a 409: the email already exists → offer Google sign-in instead.
  const [emailTaken, setEmailTaken] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  const setField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) =>
        prev[key] ? { ...prev, [key]: undefined } : prev,
      );
      if (key === "email") setEmailTaken(false);
    },
    [],
  );

  /* ---------- Logo upload ---------- */

  const acceptLogo = useCallback((file: File | undefined | null) => {
    if (!file) return;
    if (!/^image\/(png|jpe?g)$/i.test(file.type)) {
      setError("Logo harus berupa file PNG atau JPG.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setError("Ukuran logo maksimal 5MB.");
      return;
    }
    setError(null);
    setLogoError(null);
    setLogo(file);
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  const clearLogo = useCallback(() => {
    setLogo(null);
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  // Revoke the preview object URL on unmount.
  const logoPreviewRef = useRef<string | null>(null);
  logoPreviewRef.current = logoPreview;
  useEffect(() => {
    return () => {
      if (logoPreviewRef.current) URL.revokeObjectURL(logoPreviewRef.current);
    };
  }, []);

  /* ---------- Submit ---------- */

  const validate = useCallback((): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Nama wajib diisi.";
    if (!form.email.trim()) next.email = "Email wajib diisi.";
    else if (!EMAIL_RE.test(form.email.trim()))
      next.email = "Format email tidak valid.";
    if (!form.phone.trim()) next.phone = "Nomor telepon wajib diisi.";
    if (!form.kioskName.trim()) next.kioskName = "Nama kios wajib diisi.";
    if (form.tokopediaUrl.trim() && !looksLikeUrl(form.tokopediaUrl))
      next.tokopediaUrl =
        "Tautan tidak valid (contoh: https://tokopedia.com/toko-anda).";
    if (form.olxUrl.trim() && !looksLikeUrl(form.olxUrl))
      next.olxUrl = "Tautan tidak valid (contoh: https://olx.co.id/toko-anda).";
    setFieldErrors(next);

    const logoMissing = !logo;
    setLogoError(logoMissing ? "Logo / foto kios wajib diunggah." : null);

    return Object.keys(next).length === 0 && !logoMissing;
  }, [form, logo]);

  /** Fallback ketika email sudah terdaftar: OAuth Google penuh, balik ke sini. */
  const goToGoogleLogin = useCallback(() => {
    const returnTo = encodeURIComponent(
      window.location.origin + "/registrasi-seller",
    );
    window.location.href = `${loginUrl()}?return_to=${returnTo}`;
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (submitting) return;
      setError(null);
      setEmailTaken(false);
      if (!validate()) {
        pushToast("Lengkapi dulu isian yang wajib diisi.", "error");
        return;
      }

      setSubmitting(true);
      try {
        await onboardSellerManual({
          email: form.email,
          fullName: form.name,
          phone: form.phone,
          name: form.kioskName,
          fullAddress: form.location,
          city: form.city,
          areaPickup: form.pickupArea,
          description: form.description,
          tokopediaUrl: form.tokopediaUrl,
          olxUrl: form.olxUrl,
          logo,
        });
        pushToast("Pendaftaran penjual berhasil dikirim!");
        setPhase("success");
      } catch (err) {
        // 409 → email sudah dipakai. Jangan retry ke endpoint yang sama,
        // arahkan user masuk via Google (§6).
        if (isEmailTaken(err)) {
          setEmailTaken(true);
          setFieldErrors((prev) => ({
            ...prev,
            email: "Email ini sudah terdaftar.",
          }));
          pushToast("Email sudah terdaftar — masuk dengan Google.", "error");
        } else {
          // 500 dll: pertahankan isian form untuk retry.
          const message =
            err instanceof Error ? err.message : "Gagal mendaftar. Coba lagi.";
          setError(message);
          pushToast(message, "error");
        }
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, validate, form, logo, pushToast],
  );

  /* ---------- Render ---------- */

  if (phase === "success") {
    return (
      <div className="seller-page">
        <div className="seller-shell seller-state seller-result">
          <span className="seller-result-icon success">
            <CheckCircle2 size={30} />
          </span>
          <h1>Pendaftaran terkirim!</h1>
          <p>
            Kios <strong>{form.kioskName || "kamu"}</strong> sudah terdaftar
            atas nama <strong>{form.name}</strong>. Kamu bisa mulai memasang
            listing lewat aplikasi PasarMotor. Nanti login dengan email yang
            sama via Google akan otomatis tertaut ke kios ini.
          </p>
          <div className="seller-result-actions">
            <Button variant="dark" onClick={() => navigate("catalog")}>
              Telusuri Pasar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-page">
      <form className="seller-shell" onSubmit={handleSubmit} noValidate>
        <header className="seller-head">
          <h1>Pendaftaran Manual Penjual</h1>
          <p>
            Silakan lengkapi informasi berikut untuk mengatur profil penjual dan
            detail kios Anda.
          </p>
        </header>

        {error && (
          <div className="seller-alert" role="alert">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {emailTaken && (
          <div className="seller-alert info" role="alert">
            <AlertCircle size={15} />
            <span>
              Email ini sudah terdaftar di PASARMOTOR. Silakan{" "}
              <button
                type="button"
                className="seller-inline-link"
                onClick={goToGoogleLogin}
              >
                masuk dengan Google
              </button>{" "}
              untuk mengakses kios yang sudah ada.
            </span>
          </div>
        )}

        {/* --- Informasi Penjual --- */}
        <section className="seller-section">
          <h2>Informasi Penjual</h2>
          <div className="seller-grid cols-3">
            <div className="seller-field">
              <label htmlFor="seller-name">
                Nama <span className="req">*</span>
              </label>
              <input
                id="seller-name"
                placeholder="Masukkan nama lengkap Anda"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                aria-invalid={Boolean(fieldErrors.name)}
              />
              {fieldErrors.name && (
                <small className="seller-err">{fieldErrors.name}</small>
              )}
            </div>
            <div className="seller-field">
              <label htmlFor="seller-email">
                Email <span className="req">*</span>
              </label>
              <input
                id="seller-email"
                type="email"
                inputMode="email"
                placeholder="nama@contoh.com"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                aria-invalid={Boolean(fieldErrors.email)}
              />
              {fieldErrors.email && (
                <small className="seller-err">{fieldErrors.email}</small>
              )}
            </div>
            <div className="seller-field">
              <label htmlFor="seller-phone">
                Nomor Telepon <span className="req">*</span>
              </label>
              <input
                id="seller-phone"
                type="tel"
                inputMode="tel"
                placeholder="+62 812 3456 7890"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                aria-invalid={Boolean(fieldErrors.phone)}
              />
              {fieldErrors.phone && (
                <small className="seller-err">{fieldErrors.phone}</small>
              )}
            </div>
          </div>
        </section>

        {/* --- Informasi Kios --- */}
        <section className="seller-section">
          <h2>Informasi Kios</h2>

          <div className="seller-field">
            <label htmlFor="seller-kiosk">
              Nama Kios <span className="req">*</span>
            </label>
            <input
              id="seller-kiosk"
              placeholder="Masukkan nama kios"
              value={form.kioskName}
              onChange={(e) => setField("kioskName", e.target.value)}
              aria-invalid={Boolean(fieldErrors.kioskName)}
            />
            {fieldErrors.kioskName && (
              <small className="seller-err">{fieldErrors.kioskName}</small>
            )}
          </div>

          <div className="seller-field">
            <label htmlFor="seller-location">Lokasi Kios</label>
            <input
              id="seller-location"
              placeholder="Masukkan lokasi"
              value={form.location}
              onChange={(e) => setField("location", e.target.value)}
            />
          </div>

          <div className="seller-grid cols-2">
            <div className="seller-field">
              <label htmlFor="seller-city">Kota / Kabupaten</label>
              <input
                id="seller-city"
                placeholder="Masukkan kota / kabupaten"
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
              />
            </div>
            <div className="seller-field">
              <label htmlFor="seller-pickup">Area Pengambilan</label>
              <input
                id="seller-pickup"
                placeholder="Masukkan area pengambilan"
                value={form.pickupArea}
                onChange={(e) => setField("pickupArea", e.target.value)}
              />
            </div>
          </div>

          <div className="seller-grid cols-2">
            <div className="seller-field">
              <label htmlFor="seller-desc">Keterangan Toko / Deskripsi</label>
              <textarea
                id="seller-desc"
                rows={5}
                placeholder="Tulis deskripsi singkat tentang toko Anda…"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
            </div>
            <div className="seller-field">
              <label>
                Logo / Ikon <span className="req">*</span>
              </label>
              {logoPreview ? (
                <div className="seller-logo-preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoPreview} alt="Pratinjau logo" />
                  <div className="seller-logo-meta">
                    <strong>{logo?.name}</strong>
                    <button type="button" onClick={clearLogo}>
                      <X size={13} /> Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  className={`seller-dropzone ${dragOver ? "drag" : ""} ${
                    logoError ? "error" : ""
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    acceptLogo(e.dataTransfer.files?.[0]);
                  }}
                >
                  <span className="seller-dropzone-icon">
                    <UploadCloud size={20} />
                  </span>
                  <strong>Unggah logo</strong>
                  <small>PNG atau JPG · Maks 5MB</small>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => acceptLogo(e.target.files?.[0])}
                    hidden
                  />
                </label>
              )}
              {logoError && <small className="seller-err">{logoError}</small>}
            </div>
          </div>
        </section>

        {/* --- Tautan Toko --- */}
        <section className="seller-section">
          <h2>Tautan Toko</h2>
          <div className="seller-field">
            <label htmlFor="seller-tokped">Tautan Tokopedia</label>
            <input
              id="seller-tokped"
              type="url"
              placeholder="https://tokopedia.com/toko-anda"
              value={form.tokopediaUrl}
              onChange={(e) => setField("tokopediaUrl", e.target.value)}
              aria-invalid={Boolean(fieldErrors.tokopediaUrl)}
            />
            {fieldErrors.tokopediaUrl && (
              <small className="seller-err">{fieldErrors.tokopediaUrl}</small>
            )}
          </div>
          <div className="seller-field">
            <label htmlFor="seller-olx">Tautan OLX</label>
            <input
              id="seller-olx"
              type="url"
              placeholder="https://olx.co.id/toko-anda"
              value={form.olxUrl}
              onChange={(e) => setField("olxUrl", e.target.value)}
              aria-invalid={Boolean(fieldErrors.olxUrl)}
            />
            {fieldErrors.olxUrl && (
              <small className="seller-err">{fieldErrors.olxUrl}</small>
            )}
          </div>
        </section>

        <div className="seller-actions">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("landing")}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={16} className="spin" /> Mengirim…
              </>
            ) : (
              "Kirim"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
