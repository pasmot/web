import { Bookmark, Info } from 'lucide-react';
import type { Product } from '../types/product';
import { products } from '../data/products';
import { ProductGrid } from '../components/catalog/ProductGrid';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

type SavedPageProps = {
  savedIds: string[];
  onOpenProduct: (product: Product) => void;
  onToggleSave: (product: Product) => void;
  onExploreCatalog: () => void;
};

export function SavedPage({
  savedIds,
  onOpenProduct,
  onToggleSave,
  onExploreCatalog,
}: SavedPageProps) {
  const saved = products.filter((p) => savedIds.includes(p.id));

  return (
    <div className="simple-page">
      <div className="container">
        <div className="simple-page-head">
          <h1>Incaran kamu</h1>
          <p>Bandingkan ulang produk yang sudah kamu simpan sebagai shortlist.</p>
          <div className="mock-note">
            <Info size={14} />
            Mode prototype: incaran tersimpan di sesi ini saja dan hilang saat reload.
          </div>
        </div>

        {saved.length === 0 ? (
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
            products={saved}
            savedIds={savedIds}
            onOpen={onOpenProduct}
            onToggleSave={onToggleSave}
          />
        )}
      </div>
    </div>
  );
}
