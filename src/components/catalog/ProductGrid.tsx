'use client';

import { useEffect, useState } from 'react';
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

/** Responsive column count for the visual masonry (matches the CSS breakpoints). */
function useVisualColumns(): number {
  const [cols, setCols] = useState(3);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 560px)');
    const update = () => setCols(mq.matches ? 2 : 3);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return cols;
}

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
  const columnCount = useVisualColumns();
  const isRow = layout === 'row';

  // Visual masonry: distribute items round-robin into fixed columns. Unlike CSS
  // multi-column (which rebalances + reorders every time items are appended),
  // this keeps existing cards put when lazy-loading more — no layout jump.
  if (visual && !isRow) {
    if (loading) {
      const cols: number[][] = Array.from({ length: columnCount }, () => []);
      Array.from({ length: 9 }).forEach((_, i) => cols[i % columnCount].push(i));
      return (
        <div className="product-masonry">
          {cols.map((items, ci) => (
            <div className="product-masonry-col" key={ci}>
              {items.map((i) => (
                <ProductCardSkeleton key={i} index={i} visual />
              ))}
            </div>
          ))}
        </div>
      );
    }

    const cols: { product: Product; index: number }[][] = Array.from(
      { length: columnCount },
      () => [],
    );
    products.forEach((product, index) =>
      cols[index % columnCount].push({ product, index }),
    );

    return (
      <div className="product-masonry">
        {cols.map((items, ci) => (
          <div className="product-masonry-col" key={ci}>
            {items.map(({ product, index }) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                saved={savedIds.includes(product.id)}
                onOpen={onOpen}
                onToggleSave={onToggleSave}
                visual
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  const gridClass = isRow
    ? 'product-row'
    : ['product-grid', columns === 4 ? 'grid-cols-4' : '']
        .filter(Boolean)
        .join(' ');

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 6 }, (_, i) => (
          <ProductCardSkeleton key={i} index={i} />
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
          uniform={isRow}
        />
      ))}
    </div>
  );
}
