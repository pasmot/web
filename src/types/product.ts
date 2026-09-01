export type ProductTag =
  | 'Motor Baru'
  | 'Motor Bekas'
  | 'Sparepart Baru'
  | 'Aksesoris Baru';

export type ProductCategory = 'motor' | 'sparepart' | 'aksesoris';

export type Product = {
  /** Public listing id (UUID), used in URLs and as the React key. */
  id: string;
  /**
   * Internal integer id (`listings.id`) — required by the bookmark endpoints.
   * Absent on static prototype products, which then only toggle locally.
   */
  internalId?: number;
  title: string;
  /** Display price, e.g. "Rp. 31,5 Juta" */
  price: string;
  /** Numeric price in rupiah, for filtering/sorting */
  priceValue: number;
  image: string;
  gallery: string[];
  tag: ProductTag;
  category: ProductCategory;
  location: string;
  year: string;
  /** Mileage for motors, spec meta for parts/accessories */
  mileage: string;
  cc?: number;
  rating?: number;
  /** Dealer id */
  seller: string;
  /**
   * Nomor WhatsApp/HP penjual (kalau datanya ada). Dipakai sebagai tujuan chat;
   * kalau kosong, chat diarahkan ke nomor resmi PASARMOTOR.
   */
  sellerPhone?: string;
  /**
   * Unused on the PDP — like the mobile app, the description shown there is
   * derived from title/year/mileage/cc since crawled data can be incomplete.
   */
  description?: string;
};
