import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  Search,
  SearchX,
  SlidersHorizontal,
  WifiOff,
  X,
} from "lucide-react";
import type { Product } from "../types/product";
import { useCategories } from "../hooks/useCategories";
import { useFacets } from "../hooks/useFacets";
import { useCatalogListings } from "../hooks/useCatalogListings";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  conditionFor,
  DEFAULT_FILTERS,
  FilterPanel,
  priceRangeFor,
  yearRangeFor,
  type CatalogFilters,
} from "../components/catalog/FilterPanel";
import { ProductGrid } from "../components/catalog/ProductGrid";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";

type CatalogPageProps = {
  savedIds: string[];
  /** Category slug from /api/v1/categories, or null for all. */
  initialCategory: string | null;
  initialQuery: string;
  onOpenProduct: (product: Product) => void;
  onToggleSave: (product: Product) => void;
};

// Remembers the catalog UI (chips/search/filters) across client navigation so
// returning from a detail page restores the same view, not a reset one. Bound
// to the URL params it was opened with, so a fresh deep-link starts clean.
type CatalogUI = {
  initialCategory: string | null;
  initialQuery: string;
  query: string;
  filters: CatalogFilters;
};
let catalogUI: CatalogUI | null = null;

export function CatalogPage({
  savedIds,
  initialCategory,
  initialQuery,
  onOpenProduct,
  onToggleSave,
}: CatalogPageProps) {
  const restored =
    catalogUI &&
    catalogUI.initialCategory === initialCategory &&
    catalogUI.initialQuery === initialQuery
      ? catalogUI
      : null;

  const [query, setQuery] = useState(restored?.query ?? initialQuery);
  const [filters, setFilters] = useState<CatalogFilters>(
    restored?.filters ?? {
      ...DEFAULT_FILTERS,
      kategori: initialCategory ?? "semua",
    },
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  const { categories } = useCategories();
  const { facets } = useFacets();

  const debouncedQuery = useDebouncedValue(query, 300);

  // Persist the UI so a later remount (back from detail) can restore it.
  useEffect(() => {
    catalogUI = { initialCategory, initialQuery, query, filters };
  }, [initialCategory, initialQuery, query, filters]);

  // Every filter maps to an API param — any change refetches from the server.
  const { minPrice, maxPrice } = priceRangeFor(filters.harga);
  const { yearMin, yearMax } = yearRangeFor(filters.tahun);
  const {
    products: results,
    loading,
    loadingMore,
    error,
    total,
    hasMore,
    loadMore,
    reload,
  } = useCatalogListings({
    categorySlug: filters.kategori === "semua" ? null : filters.kategori,
    condition: conditionFor(filters.kondisi),
    query: debouncedQuery,
    minPrice,
    maxPrice,
    yearMin,
    yearMax,
    city: filters.lokasi === "Semua" ? undefined : filters.lokasi,
    brand: filters.brand || undefined,
    tipeMotor: filters.tipeMotor || undefined,
    ccRange: filters.ccRange || undefined,
    kondisiOrisinalitas: filters.orisinalitas || undefined,
    sellerType: filters.sellerType || undefined,
    source: filters.source || undefined,
    isVerified: filters.verified || undefined,
  });

  // Auto-load the next page when the sentinel scrolls into view. The prefetch
  // distance must exceed the sticky filter panel's height (capped near one
  // viewport) — otherwise the panel starts "riding up" against the grid's
  // bottom before the next page arrives. Loading ~1.5 viewports early keeps the
  // grid bottom off-screen, so the panel stays pinned during infinite scroll.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading || error) return;
    const prefetch = Math.max(900, Math.round(window.innerHeight * 1.5));
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: `${prefetch}px` },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, error, loadMore]);

  return (
    <div className="catalog-page">
      <div className="container">
        {/* <div className="catalog-head">
          <h1 className="catalog-title">Pasar</h1>
          <p className="catalog-sub">
            {loading
              ? 'Memuat unit terkurasi…'
              : error
                ? 'Gagal terhubung ke server'
                : `${total.toLocaleString('id-ID')} produk terkurasi siap dibandingkan`}
          </p>
        </div> */}

        <div className="catalog-body">
          <FilterPanel
            categories={categories}
            facets={facets}
            filters={filters}
            onChange={setFilters}
          />

          <div className="catalog-content">
            {/* Search sits inside the content column so it lines up with the
                grid and lets the filter panel rise to the same top row. */}
            <div className="catalog-toolbar">
              <div className="catalog-search">
                <Search size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari motor, sparepart, aksesoris…"
                  aria-label="Cari produk"
                />
                {query && (
                  <button
                    className="icon-btn"
                    onClick={() => setQuery("")}
                    aria-label="Hapus pencarian"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                className="catalog-filter-btn"
                onClick={() => setSheetOpen(true)}
              >
                <SlidersHorizontal size={16} />
                Filter
              </Button>
            </div>

            {!loading && error ? (
              <EmptyState
                icon={<WifiOff size={26} />}
                title="Gagal memuat katalog"
                description="Tidak bisa terhubung ke server PasarMotor saat ini. Periksa koneksi lalu coba lagi."
                action={
                  <Button variant="soft" onClick={reload}>
                    Coba lagi
                  </Button>
                }
              />
            ) : !loading && results.length === 0 ? (
              <EmptyState
                icon={<SearchX size={26} />}
                title="Tidak ada hasil"
                description="Coba ubah kata kunci atau reset filter — atau tanya Montir AI untuk dicarikan."
                action={
                  <Button
                    variant="soft"
                    onClick={() => {
                      setQuery("");
                      setFilters(DEFAULT_FILTERS);
                    }}
                  >
                    Reset pencarian
                  </Button>
                }
              />
            ) : (
              <>
                <ProductGrid
                  products={results}
                  savedIds={savedIds}
                  onOpen={onOpenProduct}
                  onToggleSave={onToggleSave}
                  loading={loading}
                  visual
                />

                {/* Infinite-scroll sentinel + status */}
                {!loading && !error && (
                  <div ref={sentinelRef} className="catalog-loadmore">
                    {loadingMore ? (
                      <span className="catalog-loadmore-status">
                        <Loader2 size={16} className="spin" />
                        Memuat lebih banyak…
                      </span>
                    ) : hasMore ? (
                      <Button variant="outline" onClick={loadMore}>
                        Muat lebih banyak
                      </Button>
                    ) : results.length > 0 ? (
                      <span className="catalog-loadmore-status">
                        Semua produk sudah ditampilkan
                      </span>
                    ) : null}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {sheetOpen && (
        <>
          <div
            className="modal-scrim"
            style={{ zIndex: 85 }}
            onClick={() => setSheetOpen(false)}
          />
          <FilterPanel
            categories={categories}
            facets={facets}
            filters={filters}
            onChange={setFilters}
            sheetOpen
          />
        </>
      )}
    </div>
  );
}
