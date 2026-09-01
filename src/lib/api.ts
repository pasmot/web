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
  /** Scraped listings can miss the numeric price entirely. */
  price: number | null;
  price_text: string | null;
  condition: string;
  city: string;
  province: string;
  primary_image_url?: string | null;
  seller_name?: string | null;
  seller_city?: string | null;
  /** Belum tentu dikirim backend — dipakai kalau ada. */
  seller_phone?: string | null;
  seller_whatsapp?: string | null;
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
    /** Belum tentu dikirim backend — dipakai kalau ada. */
    phone?: string | null;
    whatsapp?: string | null;
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

/* ---------- catalog facets (filter options) ---------- */

/** A single filter option. `value` is sent back to the API verbatim. */
export type FacetOption = { value: string; label: string; count: number };

/**
 * Filter option lists from /api/v1/catalog/facets. Backend curates and orders
 * these (drops count=0 / placeholder values, cleans labels), so the frontend
 * must NOT hardcode or normalize them — send each `value` as-is.
 */
export type Facets = {
  brand: FacetOption[];
  tipe_motor: FacetOption[];
  cc_range: FacetOption[];
  kondisi_orisinalitas: FacetOption[];
  category_name: FacetOption[];
  source: FacetOption[];
  condition: FacetOption[];
  seller_type: FacetOption[];
};

const EMPTY_FACETS: Facets = {
  brand: [],
  tipe_motor: [],
  cc_range: [],
  kondisi_orisinalitas: [],
  category_name: [],
  source: [],
  condition: [],
  seller_type: [],
};

function toFacetOptions(raw: unknown): FacetOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (o): o is FacetOption =>
        o && typeof o.value === 'string' && typeof o.label === 'string',
    )
    .map((o) => ({
      value: o.value,
      label: o.label,
      count: typeof o.count === 'number' ? o.count : 0,
    }));
}

/**
 * Filter facets from /api/v1/catalog/facets. Missing keys degrade to empty
 * lists (that group just won't render), so a partial/older response is safe.
 */
export async function fetchFacets(init?: RequestInit): Promise<Facets> {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/catalog/facets`,
    withOrigin(init),
  );
  if (!res.ok) throw new Error(`Facets request failed (HTTP ${res.status})`);

  const json: ApiEnvelope<Partial<Record<keyof Facets, unknown>>> =
    await res.json();
  if (!json.success || !json.data) throw new Error('Unexpected facets response');

  const d = json.data;
  return {
    brand: toFacetOptions(d.brand),
    tipe_motor: toFacetOptions(d.tipe_motor),
    cc_range: toFacetOptions(d.cc_range),
    kondisi_orisinalitas: toFacetOptions(d.kondisi_orisinalitas),
    category_name: toFacetOptions(d.category_name),
    source: toFacetOptions(d.source),
    condition: toFacetOptions(d.condition),
    seller_type: toFacetOptions(d.seller_type),
  };
}

export { EMPTY_FACETS };

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

/**
 * Display price. Scraped rows can arrive with an empty `price_text` AND a null
 * `price` — without this guard the mapper throws and takes the whole page down.
 */
function priceTextOf(priceText?: string | null, price?: number | null): string {
  const text = priceText?.trim();
  if (text) return text;
  if (typeof price === 'number' && Number.isFinite(price)) {
    return `Rp ${price.toLocaleString('id-ID')}`;
  }
  return 'Harga belum tersedia';
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
    price: priceTextOf(raw.price_text, raw.price),
    priceValue: raw.price ?? 0,
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
    sellerPhone:
      raw.seller_whatsapp?.trim() || raw.seller_phone?.trim() || undefined,
  };
}

/** A recommendation card as returned inside a Montir AI chat response. */
export type ChatRecommendation = {
  listing_id: string;
  title: string;
  price: number | null;
  price_text?: string | null;
  condition?: string | null;
  city?: string | null;
  seller_name?: string | null;
  category_id?: number | null;
  image_url?: string | null;
  /** Fallback key used elsewhere in the API for the same field. */
  primary_image_url?: string | null;
};

/**
 * Maps a chat recommendation into a Product so it renders with the shared card
 * UI. Recommendations are lighter than catalog listings (often no image / no
 * internal id) — missing fields degrade gracefully.
 */
export function mapRecommendation(rec: ChatRecommendation): Product {
  const category = CATEGORY_BY_ID[rec.category_id ?? -1] ?? 'aksesoris';
  const image = rec.image_url ?? rec.primary_image_url ?? '';
  return {
    id: rec.listing_id,
    title: rec.title,
    price: priceTextOf(rec.price_text, rec.price),
    priceValue: rec.price ?? 0,
    image,
    gallery: image ? [image] : [],
    tag: tagFor(category, rec.condition ?? ''),
    category,
    location: rec.city?.trim() || 'Indonesia',
    year: '',
    mileage: '',
    seller: rec.seller_name?.trim() || 'PasarMotor',
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
    sellerPhone:
      seller?.whatsapp?.trim() || seller?.phone?.trim() || base.sellerPhone,
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
  /* --- GenAI taxonomy facets: values come from /catalog/facets, sent as-is --- */
  brand?: string;
  tipeMotor?: string;
  /** Discrete engine-capacity label, e.g. "150-250cc" (replaces cc_min/cc_max). */
  ccRange?: string;
  kondisiOrisinalitas?: string;
  sellerType?: string;
  source?: string;
  isVerified?: boolean;
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
  // Taxonomy facets — only sent when set. Empty values must NOT be serialized:
  // the API now returns 400 for invalid params (e.g. "undefined"/"NaN").
  if (params.brand?.trim()) sp.set('brand', params.brand.trim());
  if (params.tipeMotor?.trim()) sp.set('tipe_motor', params.tipeMotor.trim());
  if (params.ccRange?.trim()) sp.set('cc_range', params.ccRange.trim());
  if (params.kondisiOrisinalitas?.trim())
    sp.set('kondisi_orisinalitas', params.kondisiOrisinalitas.trim());
  if (params.sellerType?.trim()) sp.set('seller_type', params.sellerType.trim());
  if (params.source?.trim()) sp.set('source', params.source.trim());
  if (params.isVerified) sp.set('is_verified', 'true');
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
  // Map defensively: the catalog is scraped, so a single malformed row must not
  // reject the whole request and surface as "gagal terhubung ke server".
  const items: Product[] = [];
  for (const raw of json.data) {
    try {
      items.push(mapListing(raw));
    } catch (err) {
      console.warn('Skipping unmappable listing', raw?.listing_id, err);
    }
  }

  return {
    items,
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

/* ---------- seller onboarding (jalur manual, tanpa SSO) ---------- */

/** Detail kios yang sama-sama dipakai oleh jalur SSO maupun manual. */
export type KioskInput = {
  /** Wajib. */
  phone: string;
  /** Wajib — "Nama Kios" (nama toko), bukan nama user. */
  name: string;
  fullAddress?: string;
  city?: string;
  areaPickup?: string;
  description?: string;
  tokopediaUrl?: string;
  olxUrl?: string;
  logo?: File | null;
};

/**
 * Jalur manual (§6): identitas user diketik sendiri, tanpa Google sign-in.
 * NOTE: nama field identitas (`email`, `full_name`) mengikuti bentuk
 * /api/v1/me — kalau backend memakai key lain, cukup ubah di appendKioskFields
 * caller di onboardSellerManual.
 */
export type SellerManualInput = KioskInput & {
  /** Wajib — hanya format `@` yang dicek backend, TIDAK diverifikasi kepemilikan. */
  email: string;
  /** Wajib — nama lengkap pemilik kios. */
  fullName: string;
};

/** Seller row returned by the onboard endpoint (fields beyond these are ignored). */
export type OnboardedSeller = {
  id: number;
  seller_id: string;
  name: string;
  logo_url?: string | null;
  [key: string]: unknown;
};

/** Error thrown by the onboard calls — carries the HTTP status for special-casing. */
export class OnboardError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'OnboardError';
    this.status = status;
  }
}

/**
 * True when onboarding was rejected because the email is already registered
 * (409). Per the manual: JANGAN retry — arahkan user untuk masuk via Google.
 */
export function isEmailTaken(err: unknown): boolean {
  return err instanceof OnboardError && err.status === 409;
}

/** Appends the shared kiosk fields (optional ones only when non-empty). */
function appendKioskFields(form: FormData, input: KioskInput): void {
  form.set('phone', input.phone.trim());
  form.set('name', input.name.trim());
  if (input.fullAddress?.trim()) form.set('full_address', input.fullAddress.trim());
  if (input.city?.trim()) form.set('city', input.city.trim());
  if (input.areaPickup?.trim()) form.set('area_pickup', input.areaPickup.trim());
  if (input.description?.trim()) form.set('description', input.description.trim());
  if (input.tokopediaUrl?.trim())
    form.set('tokopedia_url', input.tokopediaUrl.trim());
  if (input.olxUrl?.trim()) form.set('olx_url', input.olxUrl.trim());
  if (input.logo) form.set('logo', input.logo);
}

/**
 * Mendaftarkan user + kios sekaligus TANPA login (POST
 * /api/v1/seller/onboard-manual). Tidak mengirim Authorization header, dan
 * Content-Type diisi otomatis oleh browser (multipart boundary).
 *
 * `409` = email sudah terdaftar → lihat isEmailTaken(); jangan retry ke sini.
 */
export async function onboardSellerManual(
  input: SellerManualInput,
): Promise<OnboardedSeller> {
  const form = new FormData();
  // Identitas user (jalur manual) — diketik sendiri, bukan dari Google.
  form.set('email', input.email.trim());
  form.set('full_name', input.fullName.trim());
  appendKioskFields(form, input);

  const res = await fetch(`${API_BASE_URL}/api/v1/seller/onboard-manual`, {
    method: 'POST',
    body: form, // tanpa Authorization, tanpa Content-Type manual
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = json?.errors?.[0]?.detail as string | undefined;
    throw new OnboardError(
      detail ?? 'Gagal mendaftar sebagai penjual.',
      res.status,
    );
  }
  return json.data as OnboardedSeller;
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

/* ---------- inspections ---------- */

/** Raw inspection row from the API (create response + list rows). */
type ApiInspection = {
  id: number;
  scheduled_date: string;
  meeting_location: string;
  notes: string | null;
  fee_amount: number;
  status: string;
  created_at: string;
  listing_id: number;
  // Present on list rows (GET /me/inspections), absent on create response.
  listing_public_id?: string | null;
  title?: string | null;
  price?: number | null;
  price_text?: string | null;
  city?: string | null;
  province?: string | null;
  primary_image_url?: string | null;
};

/** UI-friendly inspection request, with the joined listing summary. */
export type Inspection = {
  id: number;
  scheduledDate: string;
  meetingLocation: string;
  notes: string | null;
  feeAmount: number;
  status: string;
  createdAt: string;
  /** Public listing id (UUID) for linking to the detail page; null if absent. */
  listingPublicId: string | null;
  title: string;
  priceText: string;
  location: string;
  image: string;
};

function mapInspection(raw: ApiInspection): Inspection {
  const priceText =
    raw.price_text?.trim() ||
    (raw.price != null ? `Rp ${raw.price.toLocaleString('id-ID')}` : '');
  return {
    id: raw.id,
    scheduledDate: raw.scheduled_date,
    meetingLocation: raw.meeting_location,
    notes: raw.notes ?? null,
    feeAmount: raw.fee_amount,
    status: raw.status,
    createdAt: raw.created_at,
    listingPublicId: raw.listing_public_id ?? null,
    title: raw.title?.trim() || 'Listing',
    priceText,
    location: locationOf(raw.city, raw.province),
    image: raw.primary_image_url ?? '',
  };
}

export type CreateInspectionPayload = {
  /** yyyy-mm-dd — the native <input type="date"> value, sent verbatim. */
  scheduled_date: string;
  meeting_location: string;
  notes?: string;
};

/**
 * Creates an inspection request for a listing. Takes the internal integer id
 * (Product.internalId), not the UUID listing_id. Returns the created row
 * (carries the authoritative fee_amount / status).
 */
export async function createInspection(
  internalId: number,
  payload: CreateInspectionPayload,
): Promise<Inspection> {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/listings/${internalId}/inspections`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
    },
  );

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = json?.errors?.[0]?.detail as string | undefined;
    throw new Error(detail ?? 'Gagal mengajukan inspeksi.');
  }
  return mapInspection(json.data as ApiInspection);
}

/** The user's inspection requests, newest first. Returns [] when unauthenticated. */
export async function fetchMyInspections(
  init?: RequestInit,
): Promise<Inspection[]> {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/me/inspections?page=1&limit=100`,
    { ...init, headers: { ...authHeaders(), ...init?.headers } },
  );
  if (res.status === 401 || res.status === 403) return [];
  if (!res.ok) throw new Error(`Inspections request failed (HTTP ${res.status})`);

  const json: ApiEnvelope<ApiInspection[]> = await res.json();
  if (!json.success || !Array.isArray(json.data)) {
    throw new Error('Unexpected inspections response');
  }
  return json.data.map(mapInspection);
}
