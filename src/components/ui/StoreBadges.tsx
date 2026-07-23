import type { ReactNode } from 'react';
import { COMPANY } from '../../data/company';

/** Apple logo (mono white) — official badge style */
function AppleLogo() {
  return (
    <svg width="26" height="30" viewBox="0 0 384 512" fill="#fff" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

/** Google Play triangle (colored) — official badge style */
function GooglePlayLogo() {
  return (
    <svg width="26" height="28" viewBox="0 0 512 512" aria-hidden="true">
      <path
        fill="#00d7fe"
        d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z"
      />
      <path
        fill="#00f076"
        d="M325.3 234.3 104.6 13l280.8 161.2-60.1 60.1z"
      />
      <path
        fill="#ffd400"
        d="m472.2 225.6-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8z"
      />
      <path
        fill="#ff3a44"
        d="m104.6 499 280.8-161.2-60.1-60.1L104.6 499z"
      />
    </svg>
  );
}

/**
 * Tautan toko aplikasi. Selama URL-nya belum diisi di data/company.ts, badge
 * tampil sebagai elemen mati bertanda "segera hadir" — bukan tautan palsu.
 */
function StoreBadge({
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
      <span className="store-badge" aria-label={`${label} — segera hadir`} aria-disabled>
        {children}
      </span>
    );
  }

  return (
    <a
      className="store-badge"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
    >
      {children}
    </a>
  );
}

export function StoreBadges() {
  return (
    <div className="store-badges">
      <StoreBadge href={COMPANY.appStoreUrl} label="Available on the App Store">
        <AppleLogo />
        <span>
          <small>Available on the</small>
          <strong>App Store</strong>
        </span>
      </StoreBadge>
      <StoreBadge href={COMPANY.playStoreUrl} label="Get it on Google Play">
        <GooglePlayLogo />
        <span>
          <small>GET IT ON</small>
          <strong>Google Play</strong>
        </span>
      </StoreBadge>
    </div>
  );
}
