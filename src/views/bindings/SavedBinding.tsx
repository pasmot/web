'use client';

import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SavedPage } from '../SavedPage';

export function SavedBinding() {
  const app = useApp();
  const { isLoggedIn, requireLogin } = app;

  // Incaran is a member feature — gate direct visits.
  useEffect(() => {
    if (!isLoggedIn) requireLogin({ kind: 'saved-view' });
  }, [isLoggedIn, requireLogin]);

  return (
    <SavedPage
      products={isLoggedIn ? app.savedProducts : []}
      savedIds={isLoggedIn ? app.savedIds : []}
      loading={app.savedLoading}
      onOpenProduct={app.openProduct}
      onToggleSave={app.toggleSave}
      onExploreCatalog={() => app.exploreCatalog()}
    />
  );
}
