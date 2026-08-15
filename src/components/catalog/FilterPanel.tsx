import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Category, FacetOption, Facets } from '../../lib/api';
import { filterOptions } from '../../data/categories';

/**
 * Filter state. Most fields map to an API query param — every change triggers a
 * new request (no client-side filtering).
 *
 * - `kategori` holds a category slug or 'semua'.
 * - `kondisi`/`harga`/`tahun`/`lokasi` are local buckets (no facet).
 * - The taxonomy fields (`brand`, `tipeMotor`, `ccRange`, `orisinalitas`,
 *   `sellerType`, `source`) hold a raw facet `value` or '' for "all" — sent to
 *   the API verbatim.
 */
export type CatalogFilters = {
  kategori: string;
  kondisi: string;
  harga: string;
  tahun: string;
  lokasi: string;
  brand: string;
  tipeMotor: string;
  ccRange: string;
  orisinalitas: string;
  sellerType: string;
  source: string;
  verified: boolean;
};

export const DEFAULT_FILTERS: CatalogFilters = {
  kategori: 'semua',
  kondisi: 'Semua',
  harga: 'Semua',
  tahun: 'Semua',
  lokasi: 'Semua',
  brand: '',
  tipeMotor: '',
  ccRange: '',
  orisinalitas: '',
  sellerType: '',
  source: '',
  verified: false,
};

type Option = { value: string; label: string; count?: number };

const toOptions = (values: readonly string[]): Option[] =>
  values.map((v) => ({ value: v, label: v }));

/** Prepends a "Semua" (value '') option to a facet list; [] stays [] so the group hides. */
const facetOptions = (facet: FacetOption[]): Option[] =>
  facet.length
    ? [{ value: '', label: 'Semua' }, ...facet.map((o) => ({ value: o.value, label: o.label, count: o.count }))]
    : [];

type ChipGroup = {
  key: keyof CatalogFilters;
  label: string;
  options: Option[];
  /** Whether the section starts expanded. */
  defaultOpen: boolean;
  /** Only meaningful for motor listings — hidden once a non-motor category is picked. */
  motorOnly?: boolean;
};

/** Category filter values for which motor-only groups (tahun, cc, dst.) should hide. */
const isNonMotorCategory = (kategori: string) =>
  kategori !== 'semua' && kategori !== 'motor';

type FilterPanelProps = {
  /** Categories from /api/v1/categories — drives the "Kategori" group. */
  categories: Category[];
  /** Filter options from /api/v1/catalog/facets — drives the taxonomy groups. */
  facets: Facets;
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  sheetOpen?: boolean;
};

export function FilterPanel({
  categories,
  facets,
  filters,
  onChange,
  sheetOpen = false,
}: FilterPanelProps) {
  // Every chip group is collapsible. Primary groups start open; secondary
  // taxonomy groups start collapsed to keep the panel scannable.
  const groups: ChipGroup[] = [
    {
      key: 'kategori',
      label: 'Kategori',
      defaultOpen: true,
      options: [
        { value: 'semua', label: 'Semua' },
        ...categories.map((c) => ({ value: c.slug, label: c.name })),
      ],
    },
    { key: 'brand', label: 'Merk', defaultOpen: true, options: facetOptions(facets.brand), motorOnly: true },
    { key: 'kondisi', label: 'Kondisi', defaultOpen: true, options: toOptions(filterOptions.kondisi) },
    { key: 'harga', label: 'Harga', defaultOpen: true, options: toOptions(filterOptions.harga) },
    { key: 'tipeMotor', label: 'Tipe Motor', defaultOpen: false, options: facetOptions(facets.tipe_motor), motorOnly: true },
    { key: 'ccRange', label: 'Kapasitas Mesin', defaultOpen: false, options: facetOptions(facets.cc_range), motorOnly: true },
    { key: 'orisinalitas', label: 'Orisinalitas', defaultOpen: false, options: facetOptions(facets.kondisi_orisinalitas), motorOnly: true },
    { key: 'tahun', label: 'Tahun', defaultOpen: false, options: toOptions(filterOptions.tahun), motorOnly: true },
    { key: 'lokasi', label: 'Lokasi', defaultOpen: false, options: toOptions(filterOptions.lokasi) },
    { key: 'sellerType', label: 'Tipe Penjual', defaultOpen: false, options: facetOptions(facets.seller_type) },
  ];

  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((g) => [g.key, g.defaultOpen])),
  );

  const toggle = (key: string) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  const isDirty = (Object.keys(DEFAULT_FILTERS) as (keyof CatalogFilters)[]).some(
    (key) => filters[key] !== DEFAULT_FILTERS[key],
  );

  const nonMotorCategory = isNonMotorCategory(filters.kategori);

  // Selecting a sparepart/aksesoris category hides the motor-only groups above —
  // also clear their values so a stale tahun/cc/dst. pick doesn't keep silently
  // narrowing results after the section disappears.
  const changeFilter = (key: keyof CatalogFilters, value: string) => {
    const next = { ...filters, [key]: value };
    if (key === 'kategori' && isNonMotorCategory(value)) {
      next.brand = DEFAULT_FILTERS.brand;
      next.tipeMotor = DEFAULT_FILTERS.tipeMotor;
      next.ccRange = DEFAULT_FILTERS.ccRange;
      next.orisinalitas = DEFAULT_FILTERS.orisinalitas;
      next.tahun = DEFAULT_FILTERS.tahun;
    }
    onChange(next);
  };

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

      <div className="filter-panel-scroll">
        {groups
          // Facet-driven groups render nothing until options load (or if the
          // facets request failed) — keeps empty sections out of the panel.
          // Motor-only groups (tahun, cc, dst.) also hide once a sparepart/
          // aksesoris category is selected, since those fields don't apply.
          .filter((g) => g.options.length > 0 && !(g.motorOnly && nonMotorCategory))
          .map(({ key, label, options }) => {
            const isOpen = open[key] ?? false;
            const selected = filters[key];
            return (
              <div className={`filter-group ${isOpen ? 'open' : ''}`} key={key}>
                <button
                  type="button"
                  className="filter-group-head"
                  aria-expanded={isOpen}
                  onClick={() => toggle(key)}
                >
                  <h4>{label}</h4>
                  <ChevronDown size={16} className="filter-group-chevron" />
                </button>
                {isOpen && (
                  <div className="filter-chips">
                    {options.map((option) => (
                      <button
                        key={option.value || 'semua'}
                        className={`filter-chip ${selected === option.value ? 'active' : ''}`}
                        onClick={() => changeFilter(key, option.value)}
                      >
                        {option.label}
                        {option.count != null && (
                          <span className="filter-chip-count">{option.count}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

        <div className="filter-group filter-group-toggle">
          <label className="filter-switch">
            <input
              type="checkbox"
              checked={filters.verified}
              onChange={(e) =>
                onChange({ ...filters, verified: e.target.checked })
              }
            />
            <span className="filter-switch-track" aria-hidden="true" />
            <span className="filter-switch-label">Penjual terverifikasi</span>
          </label>
        </div>
      </div>
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
