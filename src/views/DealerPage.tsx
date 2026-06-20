import { BadgeCheck, CalendarDays, Clock, Info, MapPin, Store } from 'lucide-react';
import type { Dealer } from '../types/dealer';
import type { Product } from '../types/product';
import { getDealerListings } from '../data/dealers';
import { ProductGrid } from '../components/catalog/ProductGrid';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';

type DealerPageProps = {
  dealer: Dealer;
  savedIds: string[];
  onOpenProduct: (product: Product) => void;
  onToggleSave: (product: Product) => void;
};

export function DealerPage({
  dealer,
  savedIds,
  onOpenProduct,
  onToggleSave,
}: DealerPageProps) {
  const listings = getDealerListings(dealer.id);

  return (
    <div className="dealer-page">
      <div className="container">
        <div className="dealer-hero">
          <div className="dealer-hero-avatar">{dealer.initials}</div>
          <div>
            <h1>
              {dealer.name}
              {dealer.verified && <BadgeCheck size={22} />}
            </h1>
            <div className="dealer-hero-meta">
              <span>
                <MapPin size={14} />
                {dealer.location}
              </span>
              <span>
                <CalendarDays size={14} />
                Bergabung {dealer.joined}
              </span>
              <span>
                <Clock size={14} />
                {dealer.responseTime}
              </span>
              {dealer.verified && <Badge tone="info">Dealer Terkurasi Pasar Motor</Badge>}
            </div>
            <p className="dealer-hero-desc">{dealer.description}</p>
          </div>
        </div>

        <div className="dealer-masked-note">
          <Info size={16} />
          Identitas lengkap dealer hanya dibagikan setelah terjadi transaksi atau chat
          resmi melalui Pasar Motor.
        </div>

        <div className="section-head">
          <h2 className="section-title" style={{ fontSize: 22 }}>
            Listing dealer ({listings.length})
          </h2>
        </div>

        {listings.length === 0 ? (
          <EmptyState
            icon={<Store size={26} />}
            title="Belum ada listing"
            description="Dealer ini belum memiliki listing aktif saat ini."
          />
        ) : (
          <ProductGrid
            products={listings}
            savedIds={savedIds}
            onOpen={onOpenProduct}
            onToggleSave={onToggleSave}
            columns={4}
          />
        )}
      </div>
    </div>
  );
}
