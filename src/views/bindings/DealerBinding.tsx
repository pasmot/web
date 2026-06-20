'use client';

import type { Dealer } from '../../types/dealer';
import { useApp } from '../../context/AppContext';
import { DealerPage } from '../DealerPage';

export function DealerBinding({ dealer }: { dealer: Dealer }) {
  const app = useApp();
  return (
    <DealerPage
      dealer={dealer}
      savedIds={app.savedIds}
      onOpenProduct={app.openProduct}
      onToggleSave={app.toggleSave}
    />
  );
}
