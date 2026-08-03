'use client';

import { useEffect, useState } from 'react';
import { EMPTY_FACETS, fetchFacets, type Facets } from '../lib/api';

// Facets rarely change — fetch once per session and share across the app.
let cached: Facets | null = null;
let inflight: Promise<Facets> | null = null;

/**
 * Filter options from /api/v1/catalog/facets (brand, tipe_motor, cc_range, …).
 * Returns empty lists immediately, then swaps in the live facets once loaded.
 * If the request fails the lists stay empty — the affected filter groups simply
 * don't render, so the catalog still works.
 */
export function useFacets() {
  const [facets, setFacets] = useState<Facets>(cached ?? EMPTY_FACETS);
  const [loading, setLoading] = useState(cached === null);

  useEffect(() => {
    if (cached) return;
    let active = true;

    inflight ??= fetchFacets().then((f) => {
      cached = f;
      return f;
    });

    inflight
      .then((f) => {
        if (!active) return;
        setFacets(f);
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

  return { facets, loading };
}
