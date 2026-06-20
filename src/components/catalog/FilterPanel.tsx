import { filterOptions } from '../../data/categories';

export type CatalogFilters = {
  jenis: string;
  harga: string;
  tahun: string;
  lokasi: string;
};

export const DEFAULT_FILTERS: CatalogFilters = {
  jenis: 'Semua',
  harga: 'Semua',
  tahun: 'Semua',
  lokasi: 'Semua',
};

const GROUPS: { key: keyof CatalogFilters; label: string }[] = [
  { key: 'jenis', label: 'Jenis' },
  { key: 'harga', label: 'Harga' },
  { key: 'tahun', label: 'Tahun' },
  { key: 'lokasi', label: 'Lokasi' },
];

type FilterPanelProps = {
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  sheetOpen?: boolean;
};

export function FilterPanel({ filters, onChange, sheetOpen = false }: FilterPanelProps) {
  const isDirty = GROUPS.some(({ key }) => filters[key] !== 'Semua');

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

      {GROUPS.map(({ key, label }) => (
        <div className="filter-group" key={key}>
          <h4>{label}</h4>
          <div className="filter-chips">
            {filterOptions[key].map((option) => (
              <button
                key={option}
                className={`filter-chip ${filters[key] === option ? 'active' : ''}`}
                onClick={() => onChange({ ...filters, [key]: option })}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}

export function applyFilters<
  T extends {
    tag: string;
    priceValue: number;
    year: string;
    location: string;
  },
>(items: T[], filters: CatalogFilters): T[] {
  return items.filter((item) => {
    if (filters.jenis !== 'Semua' && item.tag !== filters.jenis) return false;

    if (filters.harga !== 'Semua') {
      const juta = item.priceValue / 1_000_000;
      if (filters.harga === '< 10 Juta' && juta >= 10) return false;
      if (filters.harga === '10–25 Juta' && (juta < 10 || juta > 25)) return false;
      if (filters.harga === '25–40 Juta' && (juta < 25 || juta > 40)) return false;
      if (filters.harga === '> 40 Juta' && juta <= 40) return false;
    }

    if (filters.tahun !== 'Semua') {
      const year = parseInt(item.year, 10);
      if (Number.isNaN(year)) return false;
      if (filters.tahun === '2024–2025' && (year < 2024 || year > 2025)) return false;
      if (filters.tahun === '2021–2023' && (year < 2021 || year > 2023)) return false;
      if (filters.tahun === '2018–2020' && (year < 2018 || year > 2020)) return false;
      if (filters.tahun === '< 2018' && year >= 2018) return false;
    }

    if (
      filters.lokasi !== 'Semua' &&
      !item.location.toLowerCase().includes(filters.lokasi.toLowerCase())
    ) {
      return false;
    }

    return true;
  });
}
