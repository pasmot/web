'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { Product } from '../types/product';
import { fetchCatalog, type CatalogQuery } from '../lib/api';

const PAGE_SIZE = 24;

export type CatalogParams = {
  /** Category slug from /api/v1/categories, or null for all. */
  categorySlug: string | null;
  /** 'baru' | 'bekas', or undefined for all. */
  condition?: string;
  query: string;
  minPrice?: number;
  maxPrice?: number;
  yearMin?: number;
  yearMax?: number;
  city?: string;
  /* --- GenAI taxonomy facets ('' / undefined = no filter) --- */
  brand?: string;
  tipeMotor?: string;
  ccRange?: string;
  kondisiOrisinalitas?: string;
  sellerType?: string;
  source?: string;
  isVerified?: boolean;
};

type CatalogState = {
  products: Product[];
  /** Initial load / refetch after the query changes. */
  loading: boolean;
  /** Appending the next page. */
  loadingMore: boolean;
  error: string | null;
  /** Total matching listings (meta.total_count) — 0 until first load. */
  total: number;
};

/**
 * Module-level cache that survives client-side navigation (back from a detail
 * page). Keyed per filter combination; remembers the loaded pages and the last
 * scroll position so returning restores the feed exactly where it was left.
 */
type CacheEntry = {
  products: Product[];
  page: number;
  total: number;
  scrollY: number;
};
const catalogCache = new Map<string, CacheEntry>();

const keyOf = (p: CatalogParams): string =>
  JSON.stringify([
    p.categorySlug,
    p.condition ?? null,
    p.query,
    p.minPrice ?? null,
    p.maxPrice ?? null,
    p.yearMin ?? null,
    p.yearMax ?? null,
    p.city ?? null,
    p.brand ?? null,
    p.tipeMotor ?? null,
    p.ccRange ?? null,
    p.kondisiOrisinalitas ?? null,
    p.sellerType ?? null,
    p.source ?? null,
    p.isVerified ?? null,
  ]);

// Avoid the SSR warning for useLayoutEffect while still restoring scroll
// synchronously (no visible jump) on the client.
const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Live catalog listings with server-side search/filter, incremental paging and
 * back-navigation restore. "Has more" is derived from meta.total_count.
 */
export function useCatalogListings(params: CatalogParams) {
  const cacheKey = keyOf(params);
  const cached = catalogCache.get(cacheKey);

  const [state, setState] = useState<CatalogState>(() =>
    cached
      ? {
          products: cached.products,
          loading: false,
          loadingMore: false,
          error: null,
          total: cached.total,
        }
      : {
          products: [],
          loading: true,
          loadingMore: false,
          error: null,
          total: 0,
        },
  );

  const pageRef = useRef(cached?.page ?? 1);
  const [nonce, setNonce] = useState(0);

  // Latest params/key for stable callbacks + unmount cleanup.
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const cacheKeyRef = useRef(cacheKey);
  cacheKeyRef.current = cacheKey;

  const buildQuery = (page: number): CatalogQuery => {
    const p = paramsRef.current;
    return {
      categorySlug: p.categorySlug,
      condition: p.condition,
      q: p.query,
      minPrice: p.minPrice,
      maxPrice: p.maxPrice,
      yearMin: p.yearMin,
      yearMax: p.yearMax,
      city: p.city,
      brand: p.brand,
      tipeMotor: p.tipeMotor,
      ccRange: p.ccRange,
      kondisiOrisinalitas: p.kondisiOrisinalitas,
      sellerType: p.sellerType,
      source: p.source,
      isVerified: p.isVerified,
      page,
      limit: PAGE_SIZE,
    };
  };

  // Hydrate from cache when available; otherwise fetch the first page.
  useEffect(() => {
    const entry = catalogCache.get(cacheKey);
    if (entry) {
      pageRef.current = entry.page;
      setState({
        products: entry.products,
        loading: false,
        loadingMore: false,
        error: null,
        total: entry.total,
      });
      return;
    }

    let active = true;
    const controller = new AbortController();
    pageRef.current = 1;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetchCatalog(buildQuery(1), { signal: controller.signal })
      .then(({ items, total }) => {
        if (!active) return;
        catalogCache.set(cacheKey, { products: items, page: 1, total, scrollY: 0 });
        setState({
          products: items,
          loading: false,
          loadingMore: false,
          error: null,
          total,
        });
      })
      .catch((err: unknown) => {
        if (!active || controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : 'Gagal memuat data dari server';
        setState({
          products: [],
          loading: false,
          loadingMore: false,
          error: message,
          total: 0,
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, nonce]);

  // Persist the scroll position on unmount; restore it when returning.
  // On a fresh visit (no cache) start at the top — otherwise the window keeps
  // whatever scroll position the previous page (e.g. the landing) was left at.
  useIsoLayoutEffect(() => {
    window.scrollTo(0, cached?.scrollY ?? 0);
    return () => {
      const entry = catalogCache.get(cacheKeyRef.current);
      if (entry) entry.scrollY = window.scrollY;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = useCallback(() => {
    setState((prev) => {
      const hasMore = prev.products.length < prev.total;
      if (prev.loading || prev.loadingMore || !hasMore) return prev;
      const nextPage = pageRef.current + 1;
      pageRef.current = nextPage;

      fetchCatalog(buildQuery(nextPage))
        .then(({ items, total }) => {
          setState((cur) => {
            const products = [...cur.products, ...items];
            const key = cacheKeyRef.current;
            catalogCache.set(key, {
              products,
              page: nextPage,
              total,
              scrollY: catalogCache.get(key)?.scrollY ?? 0,
            });
            return { ...cur, products, loadingMore: false, total };
          });
        })
        .catch(() => {
          setState((cur) => ({ ...cur, loadingMore: false }));
        });

      return { ...prev, loadingMore: true };
    });
  }, []);

  const reload = useCallback(() => {
    catalogCache.delete(cacheKeyRef.current);
    setNonce((n) => n + 1);
  }, []);

  return {
    ...state,
    hasMore: state.products.length < state.total,
    loadMore,
    reload,
  };
}
