'use client';

import type { ProductCategory } from '../../types/product';
import { useApp } from '../../context/AppContext';
import { CatalogPage } from '../CatalogPage';

type CatalogBindingProps = {
  initialCategory: ProductCategory | null;
  initialQuery: string;
};

export function CatalogBinding({ initialCategory, initialQuery }: CatalogBindingProps) {
  const app = useApp();
  return (
    <CatalogPage
      key={`${initialCategory ?? 'semua'}-${initialQuery}`}
      savedIds={app.savedIds}
      initialCategory={initialCategory}
      initialQuery={initialQuery}
      onOpenProduct={app.openProduct}
      onToggleSave={app.toggleSave}
    />
  );
}
