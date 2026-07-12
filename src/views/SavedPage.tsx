import { Bookmark } from 'lucide-react';
import type { Product } from '../types/product';
import { ProductGrid } from '../components/catalog/ProductGrid';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

type SavedPageProps = {
  /** Server-backed wishlist (GET /api/v1/me/bookmarks). */
  products: Product[];
  savedIds: string[];
  loading: boolean;
  onOpenProduct: (product: Product) => void;
  onToggleSave: (product: Product) => void;
  onExploreCatalog: () => void;
};

export function SavedPage({
  products,
  savedIds,
  loading,
  onOpenProduct,
  onToggleSave,
  onExploreCatalog,
}: SavedPageProps) {
  return (
    <div className="simple-page">
      <div className="container">
        <div className="simple-page-head">
          <h1>Incaran kamu</h1>
          <p>Bandingkan ulang produk yang sudah kamu simpan sebagai shortlist.</p>
        </div>

        {!loading && products.length === 0 ? (
          <EmptyState
            icon={<Bookmark size={26} />}
            title="Belum ada incaran"
            description="Telusuri pasar dan tekan ikon simpan pada produk untuk menambahkannya ke sini."
            action={
              <Button onClick={onExploreCatalog}>Telusuri Pasar</Button>
            }
          />
        ) : (
          <ProductGrid
            products={products}
            savedIds={savedIds}
            onOpen={onOpenProduct}
            onToggleSave={onToggleSave}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
