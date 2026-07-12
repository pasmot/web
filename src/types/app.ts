export type AppView =
  | 'landing'
  | 'catalog'
  | 'product-detail'
  | 'dealer'
  | 'chat'
  | 'saved'
  | 'profile'
  | 'inspeksi';

import type { Product } from './product';

export type PendingAction =
  | null
  | { kind: 'wishlist'; product: Product }
  | { kind: 'profile' }
  | { kind: 'saved-view' }
  | { kind: 'inspeksi'; productId: string | null }
  | { kind: 'contact-seller'; productId: string }
  | { kind: 'chat-continue'; message: string };

export type InspeksiStatus = 'menunggu' | 'dijadwalkan' | 'selesai' | 'dibatalkan';

export type InspeksiRequest = {
  id: string;
  productId: string;
  schedule: string;
  location: string;
  note: string;
  status: InspeksiStatus;
  createdAt: string;
};
