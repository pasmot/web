import type { Category } from '../../lib/api';
import { filterOptions } from '../../data/categories';

/**
 * All filters map to API query params — every change triggers a new request
 * (no client-side filtering). `kategori` holds a category slug or 'semua'.
 */
export type CatalogFilters = {
  kategori: string;
  kondisi: string;
  harga: string;
  tahun: string;
  lokasi: string;
};

export const DEFAULT_FILTERS: CatalogFilters = {
  kategori: 'semua',
  kondisi: 'Semua',
  harga: 'Semua',
  tahun: 'Semua',
  lokasi: 'Semua',
};

type Option = { value: string; label: string };

const toOptions = (values: readonly string[]): Option[] =>
  values.map((v) => ({ value: v, label: v }));

type FilterPanelProps = {
  /** Categories from /api/v1/categories — drives the "Kategori" group. */
  categories: Category[];
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  sheetOpen?: boolean;
};

export function FilterPanel({
  categories,
  filters,
  onChange,
  sheetOpen = false,
}: FilterPanelProps) {
  const groups: { key: keyof CatalogFilters; label: string; options: Option[] }[] = [
    {
      key: 'kategori',
      label: 'Kategori',
      options: [
        { value: 'semua', label: 'Semua' },
        ...categories.map((c) => ({ value: c.slug, label: c.name })),
      ],
    },
    { key: 'kondisi', label: 'Kondisi', options: toOptions(filterOptions.kondisi) },
    { key: 'harga', label: 'Harga', options: toOptions(filterOptions.harga) },
    { key: 'tahun', label: 'Tahun', options: toOptions(filterOptions.tahun) },
    { key: 'lokasi', label: 'Lokasi', options: toOptions(filterOptions.lokasi) },
  ];

  const isDirty = groups.some(
    ({ key }) => filters[key] !== DEFAULT_FILTERS[key],
  );

  return (
    <aside className={`filter-panel ${sheetOpen ? 'sheet-open' : ''}`}>
      <div className="filter-panel-head">
        <h3>Filter Pencarian</h3>
        <button
          className="filter-reset"
          disabled={!isDirty}
          onClick={() => onChange(DEFAULT_FILTERS)}
        >
          Reset
        </button>
      </div>

      {groups.map(({ key, label, options }) => (
        <div className="filter-group" key={key}>
          <h4>{label}</h4>
          <div className="filter-chips">
            {options.map((option) => (
              <button
                key={option.value}
                className={`filter-chip ${filters[key] === option.value ? 'active' : ''}`}
                onClick={() => onChange({ ...filters, [key]: option.value })}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}

/** Maps the "Kondisi" chip to the API condition param. */
export function conditionFor(kondisi: string): string | undefined {
  switch (kondisi) {
    case 'Baru':
      return 'baru';
    case 'Bekas':
      return 'bekas';
    default:
      return undefined;
  }
}

/** Maps the "Harga" chip to API price bounds (in rupiah). */
export function priceRangeFor(harga: string): {
  minPrice?: number;
  maxPrice?: number;
} {
  switch (harga) {
    case '< 10 Juta':
      return { maxPrice: 9_999_999 };
    case '10–25 Juta':
      return { minPrice: 10_000_000, maxPrice: 25_000_000 };
    case '25–40 Juta':
      return { minPrice: 25_000_000, maxPrice: 40_000_000 };
    case '> 40 Juta':
      return { minPrice: 40_000_001 };
    default:
      return {};
  }
}

/** Maps the "Tahun" chip to API year bounds. */
export function yearRangeFor(tahun: string): {
  yearMin?: number;
  yearMax?: number;
} {
  switch (tahun) {
    case '2024–2025':
      return { yearMin: 2024, yearMax: 2025 };
    case '2021–2023':
      return { yearMin: 2021, yearMax: 2023 };
    case '2018–2020':
      return { yearMin: 2018, yearMax: 2020 };
    case '< 2018':
      return { yearMax: 2017 };
    default:
      return {};
  }
}
