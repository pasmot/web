import { Apple, Play } from 'lucide-react';

type StoreBadgesProps = {
  /** Use translucent style for dark backgrounds */
  onDark?: boolean;
};

export function StoreBadges({ onDark = false }: StoreBadgesProps) {
  const cls = `store-badge ${onDark ? 'on-dark' : ''}`;
  return (
    <div className="store-badges">
      <a className={cls} href="#" onClick={(e) => e.preventDefault()}>
        <Apple size={24} />
        <span>
          <small>Download di</small>
          <strong>App Store</strong>
        </span>
      </a>
      <a className={cls} href="#" onClick={(e) => e.preventDefault()}>
        {/* Triangle icon reads left-heavy — nudge right for optical centering */}
        <Play size={22} style={{ transform: 'translateX(2px)' }} />
        <span>
          <small>Dapatkan di</small>
          <strong>Google Play</strong>
        </span>
      </a>
    </div>
  );
}
