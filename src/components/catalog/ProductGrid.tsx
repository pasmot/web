import type { Product } from '../../types/product';
import { ProductCard, ProductCardSkeleton } from './ProductCard';

type ProductGridProps = {
  products: Product[];
  savedIds: string[];
  onOpen: (product: Product) => void;
  onToggleSave: (product: Product) => void;
  loading?: boolean;
  columns?: 3 | 4;
  /** Pinterest-style image-only cards */
  visual?: boolean;
  /** 'masonry' (default) or a single horizontally-scrollable 'row' of equal cards */
  layout?: 'masonry' | 'row';
};

export function ProductGrid({
  products,
  savedIds,
  onOpen,
  onToggleSave,
  loading = false,
  columns = 3,
  visual = false,
  layout = 'masonry',
}: ProductGridProps) {
  const isRow = layout === 'row';
  const gridClass = isRow
    ? 'product-row'
    : [
        'product-grid',
        columns === 4 ? 'grid-cols-4' : '',
        visual ? 'grid-visual' : '',
      ]
        .filter(Boolean)
        .join(' ');

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: visual ? 9 : 6 }, (_, i) => (
          <ProductCardSkeleton key={i} index={i} visual={visual} />
        ))}
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          index={i}
          saved={savedIds.includes(product.id)}
          onOpen={onOpen}
          onToggleSave={onToggleSave}
          visual={visual}
          uniform={isRow}
        />
      ))}
    </div>
  );
}
