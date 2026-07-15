'use client';

import { useApp } from '../../context/AppContext';
import { LandingPage } from '../LandingPage';

export function LandingBinding() {
  const app = useApp();
  return (
    <LandingPage
      savedIds={app.savedIds}
      onExploreCatalog={app.exploreCatalog}
      onOpenChat={() => app.setDockExpanded(true)}
      onOpenProduct={app.openProduct}
      onToggleSave={app.toggleSave}
    />
  );
}
