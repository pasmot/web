'use client';

import { useEffect, useState } from 'react';
import { fetchCategories, type Category } from '../lib/api';
import { FALLBACK_CATEGORIES } from '../data/categories';

// Categories rarely change — fetch once per session and share across pages.
let cached: Category[] | null = null;
let inflight: Promise<Category[]> | null = null;

/**
 * Categories from /api/v1/categories. Returns the static fallback immediately
 * (so chips/cards render without a flash) and swaps in the live list once
 * loaded; keeps the fallback if the request fails.
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(
    cached ?? FALLBACK_CATEGORIES,
  );
  const [loading, setLoading] = useState(cached === null);

  useEffect(() => {
    if (cached) return;
    let active = true;

    inflight ??= fetchCategories().then((list) => {
      cached = list;
      return list;
    });

    inflight
      .then((list) => {
        if (!active) return;
        setCategories(list);
        setLoading(false);
      })
      .catch(() => {
        inflight = null;
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { categories, loading };
}
