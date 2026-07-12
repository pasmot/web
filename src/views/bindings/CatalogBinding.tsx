'use client';

import { useApp } from '../../context/AppContext';
import { CatalogPage } from '../CatalogPage';

type CatalogBindingProps = {
  /** Category slug from /api/v1/categories, or null for all. */
  initialCategory: string | null;
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
