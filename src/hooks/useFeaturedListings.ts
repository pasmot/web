'use client';

import { useEffect, useState } from 'react';
import type { Product } from '../types/product';
import { fetchCatalog } from '../lib/api';

// Cached for the session so returning to the landing page doesn't refetch.
let cache: Product[] | null = null;
let inflight: Promise<Product[]> | null = null;

/**
 * "Unit pilihan minggu ini" — the first page of motor listings from the
 * catalog. Returns [] while loading (or on failure); the caller falls back to
 * static featured units so the section is never empty.
 */
export function useFeaturedListings(limit = 4) {
  const [products, setProducts] = useState<Product[]>(cache ?? []);
  const [loading, setLoading] = useState(cache === null);

  useEffect(() => {
    if (cache) return;
    let active = true;

    inflight ??= fetchCatalog({ categorySlug: 'motor', limit }).then(({ items }) => {
      cache = items;
      return items;
    });

    inflight
      .then((items) => {
        if (!active) return;
        setProducts(items);
        setLoading(false);
      })
      .catch(() => {
        inflight = null;
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [limit]);

  return { products, loading };
}
