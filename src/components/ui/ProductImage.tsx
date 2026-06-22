'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { ImageOff } from 'lucide-react';

type ProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  /** Hide the "Gambar tidak tersedia" label (e.g. tiny thumbnails). */
  compact?: boolean;
};

/**
 * <img> with a graceful fallback. Listing photos are hotlink-protected /
 * signed URLs that can fail to load — instead of a broken-image glyph we show
 * a branded placeholder that fills the same box.
 */
export function ProductImage({
  src,
  alt,
  className,
  style,
  compact = false,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  // Reset when the source changes (e.g. navigating the PDP gallery).
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <div
        className={`img-fallback ${className ?? ''}`.trim()}
        style={style}
        role="img"
        aria-label={alt}
      >
        <ImageOff size={compact ? 18 : 28} strokeWidth={1.6} />
        {!compact && <span>Gambar tidak tersedia</span>}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
