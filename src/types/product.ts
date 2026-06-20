export type ProductTag =
  | 'Motor Baru'
  | 'Motor Bekas'
  | 'Sparepart Baru'
  | 'Aksesoris Baru';

export type ProductCategory = 'motor' | 'sparepart' | 'aksesoris';

export type Product = {
  id: string;
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
   * Unused on the PDP — like the mobile app, the description shown there is
   * derived from title/year/mileage/cc since crawled data can be incomplete.
   */
  description?: string;
};
