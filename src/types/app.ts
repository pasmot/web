export type AppView =
  | 'landing'
  | 'catalog'
  | 'product-detail'
  | 'dealer'
  | 'chat'
  | 'saved'
  | 'profile'
  | 'inspeksi'
  | 'info';

import type { Product } from './product';

export type PendingAction =
  | null
  | { kind: 'wishlist'; product: Product }
  | { kind: 'profile' }
  | { kind: 'saved-view' }
  | { kind: 'inspeksi-view' }
  | { kind: 'inspeksi'; product: Product | null }
  | { kind: 'chat-continue'; message: string };
