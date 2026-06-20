import type { Product } from './product';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  /** Optional small label above the bubble, e.g. "Snapshot produk" */
  badge?: string;
  /** Product recommendation cards rendered inside the bubble */
  products?: Product[];
  /** Optional checklist rendered inside the bubble */
  checklist?: string[];
};

export type ChatMode = 'recommendation' | 'product-advice';
