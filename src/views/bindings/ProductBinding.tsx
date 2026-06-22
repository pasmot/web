'use client';

import { useEffect } from 'react';
import type { Product } from '../../types/product';
import { useApp } from '../../context/AppContext';
import { ProductDetailPage } from '../ProductDetailPage';

export function ProductBinding({ product }: { product: Product }) {
  const app = useApp();
  const { setActiveProduct } = app;

  // Register this product so expanding the Montir dock starts product-advice.
  useEffect(() => {
    setActiveProduct(product);
    return () => setActiveProduct(null);
  }, [product, setActiveProduct]);

  return (
    <ProductDetailPage
      product={product}
      savedIds={app.savedIds}
      onBackToCatalog={app.backToCatalog}
      onOpenProduct={app.openProduct}
      onToggleSave={app.toggleSave}
      onRequestInspeksi={(p) => app.requestInspeksi(p)}
      onContactSeller={app.contactSeller}
      onOpenDealer={app.openDealer}
    />
  );
}
