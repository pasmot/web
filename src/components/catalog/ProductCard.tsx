import { Bookmark, MapPin, Star } from 'lucide-react';
import type { Product } from '../../types/product';
import { Badge } from '../ui/Badge';

type ProductCardProps = {
  product: Product;
  saved: boolean;
  onOpen: (product: Product) => void;
  onToggleSave: (product: Product) => void;
  /** Used for masonry rhythm + stagger delay */
  index?: number;
  /** Pinterest-style: image only, no name/price/location */
  visual?: boolean;
  /** Equal-size card for single-row (app-style) treatment */
  uniform?: boolean;
};

const MEDIA_HEIGHTS = [200, 248, 218, 264, 188, 232];
const VISUAL_HEIGHTS = [260, 340, 300, 380, 240, 320];
const UNIFORM_HEIGHT = 178;

export function ProductCard({
  product,
  saved,
  onOpen,
  onToggleSave,
  index = 0,
  visual = false,
  uniform = false,
}: ProductCardProps) {
  const heights = visual ? VISUAL_HEIGHTS : MEDIA_HEIGHTS;
  const mediaHeight = uniform
    ? UNIFORM_HEIGHT
    : product.category === 'motor'
      ? heights[index % heights.length]
      : heights[(index + 1) % heights.length] - 30;

  if (visual) {
    return (
      <div
        className="product-card product-card-visual"
        style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
      >
        <button
          className="product-card-media"
          onClick={() => onOpen(product)}
          aria-label={product.title}
          title={product.title}
        >
          <img src={product.image} alt={product.title} style={{ height: mediaHeight }} />
        </button>
        <button
          className={`product-card-save ${saved ? 'saved' : ''}`}
          onClick={() => onToggleSave(product)}
          aria-label={saved ? 'Hapus dari incaran' : 'Simpan ke incaran'}
          title={saved ? 'Hapus dari incaran' : 'Simpan ke incaran'}
        >
          <Bookmark size={18} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="product-card"
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    >
      <button
        className="product-card-media"
        style={{ display: 'block', width: '100%' }}
        onClick={() => onOpen(product)}
        aria-label={product.title}
      >
        <img src={product.image} alt={product.title} style={{ height: mediaHeight }} />
        <span className="product-card-tag">
          <Badge tone={product.tag === 'Motor Baru' ? 'red' : 'dark'}>{product.tag}</Badge>
        </span>
      </button>
      <button
        className={`product-card-save ${saved ? 'saved' : ''}`}
        onClick={() => onToggleSave(product)}
        aria-label={saved ? 'Hapus dari incaran' : 'Simpan ke incaran'}
        title={saved ? 'Hapus dari incaran' : 'Simpan ke incaran'}
      >
        <Bookmark size={18} />
      </button>
      <button
        className="product-card-body"
        style={{ display: 'block', width: '100%', textAlign: 'left' }}
        onClick={() => onOpen(product)}
      >
        <h3>{product.title}</h3>
        <div className="product-card-price">{product.price}</div>
        <div className="product-card-meta">
          <span>
            <MapPin size={12} />
            {product.location}
          </span>
          <span>{product.year}</span>
          <span>{product.mileage}</span>
          {product.rating && (
            <span className="product-card-rating">
              <Star size={12} />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}

export function ProductCardSkeleton({
  index = 0,
  visual = false,
}: {
  index?: number;
  visual?: boolean;
}) {
  const heights = visual ? VISUAL_HEIGHTS : MEDIA_HEIGHTS;
  const mediaHeight = heights[index % heights.length];

  if (visual) {
    return (
      <div className="product-skeleton">
        <div className="skeleton" style={{ height: mediaHeight, borderRadius: 0 }} />
      </div>
    );
  }

  return (
    <div className="product-skeleton">
      <div className="skeleton" style={{ height: mediaHeight, borderRadius: 0 }} />
      <div className="product-skeleton-body">
        <div className="skeleton" style={{ height: 15, width: '80%' }} />
        <div className="skeleton" style={{ height: 18, width: '45%' }} />
        <div className="skeleton" style={{ height: 12, width: '65%' }} />
      </div>
    </div>
  );
}
