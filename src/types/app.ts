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
  | { kind: 'inspeksi-view' }
  | { kind: 'inspeksi'; product: Product | null }
  | { kind: 'contact-seller'; productId: string }
  | { kind: 'chat-continue'; message: string };
