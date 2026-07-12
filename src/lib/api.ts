import type { Product, ProductCategory } from '../types/product';
import { authHeaders } from './auth';

/**
 * PasarMotor API client.
 *
 * The base URL can be overridden with NEXT_PUBLIC_API_BASE_URL.
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.pasarmotor.com'
).replace(/\/$/, '');

/**
 * The API gates /api/v1/* by Origin (requests without an allowed Origin get
 * 403). Browsers set Origin automatically, but server-side fetches (SSR) send
 * none — so we inject an allowed Origin there. Must be one of the backend's
 * FRONTEND_URLS; defaults to the production site.
 */
const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_ORIGIN ?? 'https://pasarmotor.com'
).replace(/\/$/, '');

/** Adds an Origin header for server-side requests (no-op in the browser). */
function withOrigin(init?: RequestInit): RequestInit | undefined {
  if (typeof window !== 'undefined') return init;
  return {
    ...init,
    headers: { Origin: SITE_ORIGIN, ...init?.headers },
  };
}

/* ---------- API response shapes ---------- */

type ApiEnvelope<T> = {
  success: boolean;
  status_code: number;
  data: T;
  meta?: { total_count: number; page: number; per_page: number };
};

export type ApiListing = {
  id: number;
  listing_id: string;
  seller_id: number;
  category_id: number | null;
  title: string;
  price: number;
  price_text: string | null;
  condition: string;
  city: string;
  province: string;
  primary_image_url?: string | null;
  seller_name?: string | null;
  seller_city?: string | null;
};

type ApiListingDetail = {
  images: {
    image_url: string;
    is_primary: boolean;
    sort_order: number;
  }[];
  listing: ApiListing & {
    description?: string | null;
    source_url?: string | null;
    metadata?: { rating?: string; year?: number; brand?: string } | null;
  };
  seller: {
    seller_id: string;
    name?: string | null;
    city?: string | null;
    province?: string | null;
  } | null;
};

/* ---------- categories ---------- */

export type Category = {
  id: number;
  name: string;
  slug: string;
};

/** Categories from /api/v1/categories — the source of truth for filtering. */
export async function fetchCategories(init?: RequestInit): Promise<Category[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/categories`, withOrigin(init));
  if (!res.ok) throw new Error(`Categories request failed (HTTP ${res.status})`);

  const json: ApiEnvelope<Category[]> = await res.json();
  if (!json.success || !Array.isArray(json.data)) {
    throw new Error('Unexpected categories response');
  }
  return [...json.data].sort((a, b) => a.id - b.id);
}

// Display grouping only (tag/label on cards). The filter itself uses the
// category slug straight from the API, so new categories don't break it.
const CATEGORY_BY_ID: Record<number, ProductCategory> = {
  1: 'motor',
  2: 'sparepart',
  3: 'aksesoris',
};

// Slug lookup for app-internal display categories (e.g. "produk serupa" on the
// detail page). User-facing filtering uses slugs from fetchCategories directly.
const SLUG_BY_CATEGORY: Record<ProductCategory, string> = {
  motor: 'motor',
  sparepart: 'spare-part-motor',
  aksesoris: 'aksesoris-motor',
};

export const categorySlug = (category: ProductCategory): string =>
  SLUG_BY_CATEGORY[category];

function tagFor(category: ProductCategory, condition: string): Product['tag'] {
  if (category === 'motor') {
    // Backend uses "used"/"new"; scraped data uses "bekas"/"baru".
    const isUsed = /bekas|used/i.test(condition);
    return isUsed ? 'Motor Bekas' : 'Motor Baru';
  }
  return category === 'sparepart' ? 'Sparepart Baru' : 'Aksesoris Baru';
}

function locationOf(
  city?: string | null,
  province?: string | null,
  fallback?: string | null,
): string {
  const parts = [city, province]
    .map((p) => p?.trim())
    .filter((p): p is string => Boolean(p));
  return parts.join(', ') || fallback?.trim() || 'Indonesia';
}

/* ---------- mappers (API → app Product) ---------- */

export function mapListing(raw: ApiListing): Product {
  const category = CATEGORY_BY_ID[raw.category_id ?? -1] ?? 'aksesoris';
  const image = raw.primary_image_url ?? '';
  return {
    id: raw.listing_id,
    internalId: raw.id,
    title: raw.title,
    price: raw.price_text?.trim() || `Rp ${raw.price.toLocaleString('id-ID')}`,
    priceValue: raw.price,
    image,
    gallery: image ? [image] : [],
    tag: tagFor(category, raw.condition),
    category,
    location: locationOf(raw.city, raw.province, raw.seller_city),
    // The scraped catalog has no structured year / mileage — left blank so the
    // UI degrades gracefully (catalog cards are image-only anyway).
    year: '',
    mileage: '',
    seller: raw.seller_name?.trim() || `seller-${raw.seller_id}`,
  };
}

function mapDetail(detail: ApiListingDetail): Product {
  const { listing, images, seller } = detail;
  const base = mapListing(listing);

  const gallery = [...images]
    .sort(
      (a, b) =>
        Number(b.is_primary) - Number(a.is_primary) ||
        a.sort_order - b.sort_order,
    )
    .map((img) => img.image_url)
    .filter(Boolean);

  const ratingRaw = listing.metadata?.rating;
  const rating = ratingRaw ? Number(ratingRaw) : NaN;
  const year = listing.metadata?.year;

  return {
    ...base,
    image: gallery[0] ?? base.image,
    gallery: gallery.length ? gallery : base.gallery,
    description: listing.description?.trim() || undefined,
    seller: seller?.name?.trim() || base.seller,
    rating: Number.isFinite(rating) && rating > 0 ? rating : undefined,
    year: year ? String(year) : base.year,
    location: locationOf(listing.city, listing.province, seller?.city),
  };
}

/* ---------- fetchers ---------- */

export type CatalogQuery = {
  q?: string;
  /** Category slug as returned by /api/v1/categories. */
  categorySlug?: string | null;
  /** Listing condition as stored by the API: 'baru' | 'bekas'. */
  condition?: string | null;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  yearMin?: number;
  yearMax?: number;
  brand?: string;
  ccMin?: number;
  ccMax?: number;
  page?: number;
  limit?: number;
};

export type CatalogResult = {
  items: Product[];
  /** Total matching listings across all pages (from meta.total_count). */
  total: number;
};

export async function fetchCatalog(
  params: CatalogQuery = {},
  init?: RequestInit,
): Promise<CatalogResult> {
  const sp = new URLSearchParams();
  if (params.q?.trim()) sp.set('q', params.q.trim());
  if (params.categorySlug) sp.set('category_slug', params.categorySlug);
  if (params.condition) sp.set('condition', params.condition);
  if (params.city?.trim()) sp.set('city', params.city.trim());
  if (params.minPrice != null) sp.set('min_price', String(params.minPrice));
  if (params.maxPrice != null) sp.set('max_price', String(params.maxPrice));
  if (params.yearMin != null) sp.set('year_min', String(params.yearMin));
  if (params.yearMax != null) sp.set('year_max', String(params.yearMax));
  if (params.brand?.trim()) sp.set('brand', params.brand.trim());
  if (params.ccMin != null) sp.set('cc_min', String(params.ccMin));
  if (params.ccMax != null) sp.set('cc_max', String(params.ccMax));
  sp.set('page', String(params.page ?? 1));
  sp.set('limit', String(params.limit ?? 24));

  const res = await fetch(
    `${API_BASE_URL}/api/v1/catalog/listings?${sp}`,
    withOrigin(init),
  );
  if (!res.ok) throw new Error(`Catalog request failed (HTTP ${res.status})`);

  const json: ApiEnvelope<ApiListing[]> = await res.json();
  if (!json.success || !Array.isArray(json.data)) {
    throw new Error('Unexpected catalog response');
  }
  return {
    items: json.data.map(mapListing),
    total: json.meta?.total_count ?? json.data.length,
  };
}

export async function fetchListing(
  id: string,
  init?: RequestInit,
): Promise<Product | null> {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/catalog/listings/${encodeURIComponent(id)}`,
    withOrigin(init),
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Listing request failed (HTTP ${res.status})`);

  const json: ApiEnvelope<ApiListingDetail> = await res.json();
  if (!json.success || !json.data?.listing) return null;
  return mapDetail(json.data);
}

/* ---------- authenticated (Bearer) ---------- */

export type MeProfile = {
  user: {
    id: number;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
  };
  seller: {
    id: number;
    seller_id: string;
    name: string;
    city?: string | null;
    tier?: number;
    is_verified?: boolean;
  } | null;
};

/** Current user's profile. Returns null if unauthenticated (401). */
export async function fetchMe(init?: RequestInit): Promise<MeProfile | null> {
  const res = await fetch(`${API_BASE_URL}/api/v1/me`, {
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  });
  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) throw new Error(`Profile request failed (HTTP ${res.status})`);

  const json: ApiEnvelope<MeProfile> = await res.json();
  if (!json.success) return null;
  return json.data;
}

/** Updates the current user's profile (full_name / bio). */
export async function updateMe(body: {
  full_name?: string;
  bio?: string;
}): Promise<MeProfile> {
  const res = await fetch(`${API_BASE_URL}/api/v1/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Update profile failed (HTTP ${res.status})`);

  const json: ApiEnvelope<MeProfile> = await res.json();
  return json.data;
}

/* ---------- bookmarks (wishlist) ---------- */

export type BookmarkToggleResult = {
  /** Bookmark state AFTER the toggle. */
  bookmarked: boolean;
  saves_count: number;
};

/**
 * Toggles a bookmark on a listing. Takes the internal integer id
 * (Product.internalId), not the UUID listing_id.
 */
export async function toggleBookmark(
  internalId: number,
): Promise<BookmarkToggleResult> {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/listings/${internalId}/bookmark`,
    { method: 'POST', headers: authHeaders() },
  );
  if (!res.ok) throw new Error(`Bookmark request failed (HTTP ${res.status})`);

  const json: ApiEnvelope<BookmarkToggleResult> = await res.json();
  if (!json.success) throw new Error('Unexpected bookmark response');
  return json.data;
}

type ApiBookmark = ApiListing & {
  bookmark_id: number;
  bookmarked_at: string;
};

/**
 * The user's wishlist, newest first. Returns [] when unauthenticated.
 * Fetches up to the API's max page size — enough for a personal wishlist.
 */
export async function fetchMyBookmarks(init?: RequestInit): Promise<Product[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/me/bookmarks?page=1&limit=100`, {
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  });
  if (res.status === 401 || res.status === 403) return [];
  if (!res.ok) throw new Error(`Bookmarks request failed (HTTP ${res.status})`);

  const json: ApiEnvelope<ApiBookmark[]> = await res.json();
  if (!json.success || !Array.isArray(json.data)) {
    throw new Error('Unexpected bookmarks response');
  }
  return json.data.map(mapListing);
}
