import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Search, SearchX, SlidersHorizontal, WifiOff, X } from 'lucide-react';
import type { Product, ProductCategory } from '../types/product';
import { searchSuggestions } from '../data/categories';
import { useCatalogListings } from '../hooks/useCatalogListings';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  applyFilters,
  DEFAULT_FILTERS,
  FilterPanel,
  priceRangeFor,
  yearRangeFor,
  type CatalogFilters,
} from '../components/catalog/FilterPanel';
import { ProductGrid } from '../components/catalog/ProductGrid';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

type CatalogPageProps = {
  savedIds: string[];
  initialCategory: ProductCategory | null;
  initialQuery: string;
  onOpenProduct: (product: Product) => void;
  onToggleSave: (product: Product) => void;
};

const CATEGORY_CHIPS: { id: ProductCategory | 'semua'; label: string }[] = [
  { id: 'semua', label: 'Semua' },
  { id: 'motor', label: 'Motor' },
  { id: 'sparepart', label: 'Sparepart' },
  { id: 'aksesoris', label: 'Aksesoris' },
];

// Remembers the catalog UI (chips/search/filters) across client navigation so
// returning from a detail page restores the same view, not a reset one. Bound
// to the URL params it was opened with, so a fresh deep-link starts clean.
type CatalogUI = {
  initialCategory: ProductCategory | null;
  initialQuery: string;
  category: ProductCategory | 'semua';
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

  const [category, setCategory] = useState<ProductCategory | 'semua'>(
    restored?.category ?? initialCategory ?? 'semua',
  );
  const [query, setQuery] = useState(restored?.query ?? initialQuery);
  const [filters, setFilters] = useState<CatalogFilters>(
    restored?.filters ?? DEFAULT_FILTERS,
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  const debouncedQuery = useDebouncedValue(query, 300);

  // Persist the UI so a later remount (back from detail) can restore it.
  useEffect(() => {
    catalogUI = { initialCategory, initialQuery, category, query, filters };
  }, [initialCategory, initialQuery, category, query, filters]);

  // Server-side: category, search, price (Harga), year (Tahun) and city (Lokasi).
  const { minPrice, maxPrice } = priceRangeFor(filters.harga);
  const { yearMin, yearMax } = yearRangeFor(filters.tahun);
  const {
    products: fetched,
    loading,
    loadingMore,
    error,
    total,
    hasMore,
    loadMore,
    reload,
  } = useCatalogListings({
    category: category === 'semua' ? null : category,
    query: debouncedQuery,
    minPrice,
    maxPrice,
    yearMin,
    yearMax,
    city: filters.lokasi === 'Semua' ? undefined : filters.lokasi,
  });

  // Client-side refine only for what the API can't do (Jenis/condition).
  const results = useMemo(
    () =>
      applyFilters(fetched, {
        ...filters,
        harga: 'Semua',
        lokasi: 'Semua',
        tahun: 'Semua',
      }),
    [fetched, filters],
  );

  // Auto-load the next page when the sentinel scrolls into view.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading || error) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '600px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, error, loadMore]);

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="catalog-head">
          <h1 className="catalog-title">Pasar</h1>
          <p className="catalog-sub">
            {loading
              ? 'Memuat unit terkurasi…'
              : error
                ? 'Gagal terhubung ke server'
                : `${total.toLocaleString('id-ID')} produk terkurasi siap dibandingkan`}
          </p>
        </div>

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
                onClick={() => setQuery('')}
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

        <div className="category-chip-row">
          {CATEGORY_CHIPS.map((chip) => (
            <button
              key={chip.id}
              className={`category-chip ${category === chip.id ? 'active' : ''}`}
              onClick={() => setCategory(chip.id)}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="catalog-body">
          <FilterPanel filters={filters} onChange={setFilters} />

          <div>
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
                      setQuery('');
                      setFilters(DEFAULT_FILTERS);
                      setCategory('semua');
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

            {!loading && results.length > 0 && query.trim() === '' && (
              <div
                style={{
                  marginTop: 28,
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                  Sering dicari:
                </span>
                {searchSuggestions.map((s) => (
                  <button key={s} className="chat-chip" onClick={() => setQuery(s)}>
                    {s}
                  </button>
                ))}
              </div>
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
            filters={filters}
            onChange={setFilters}
            sheetOpen
          />
        </>
      )}
    </div>
  );
}
