import { useEffect, useMemo, useState } from 'react';
import { Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import type { Product, ProductCategory } from '../types/product';
import { products } from '../data/products';
import { searchSuggestions } from '../data/categories';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  applyFilters,
  DEFAULT_FILTERS,
  FilterPanel,
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

export function CatalogPage({
  savedIds,
  initialCategory,
  initialQuery,
  onOpenProduct,
  onToggleSave,
}: CatalogPageProps) {
  const [category, setCategory] = useState<ProductCategory | 'semua'>(
    initialCategory ?? 'semua',
  );
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const debouncedQuery = useDebouncedValue(query, 200);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    setCategory(initialCategory ?? 'semua');
  }, [initialCategory]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const results = useMemo(() => {
    let list = products;
    if (category !== 'semua') {
      list = list.filter((p) => p.category === category);
    }
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tag.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q),
      );
    }
    return applyFilters(list, filters);
  }, [category, debouncedQuery, filters]);

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="catalog-head">
          <h1 className="catalog-title">Pasar</h1>
          <p className="catalog-sub">
            {loading
              ? 'Memuat unit terkurasi…'
              : `${results.length} produk terkurasi siap dibandingkan`}
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
            {!loading && results.length === 0 ? (
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
              <ProductGrid
                products={results}
                savedIds={savedIds}
                onOpen={onOpenProduct}
                onToggleSave={onToggleSave}
                loading={loading}
                visual
              />
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
