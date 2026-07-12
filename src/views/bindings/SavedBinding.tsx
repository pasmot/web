'use client';

import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SavedPage } from '../SavedPage';

export function SavedBinding() {
  const app = useApp();
  const { isLoggedIn, authReady, requireLogin } = app;

  // Incaran is a member feature — gate direct visits. Wait for authReady so a
  // logged-in user isn't briefly treated as a guest before the token restores.
  useEffect(() => {
    if (authReady && !isLoggedIn) requireLogin({ kind: 'saved-view' });
  }, [authReady, isLoggedIn, requireLogin]);

  return (
    <SavedPage
      products={isLoggedIn ? app.savedProducts : []}
      savedIds={isLoggedIn ? app.savedIds : []}
      // Show the skeleton (not the empty state) until auth + wishlist resolve.
      loading={!authReady || app.savedLoading}
      onOpenProduct={app.openProduct}
      onToggleSave={app.toggleSave}
      onExploreCatalog={() => app.exploreCatalog()}
    />
  );
}
