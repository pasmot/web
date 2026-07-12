'use client';

import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { InspeksiPage } from '../InspeksiPage';

export function InspeksiBinding() {
  const app = useApp();
  const { isLoggedIn, authReady, requireLogin } = app;

  // Inspeksi is a member feature — gate direct visits. Wait for authReady so a
  // logged-in user isn't briefly treated as a guest before the token restores.
  useEffect(() => {
    if (authReady && !isLoggedIn) requireLogin({ kind: 'inspeksi-view' });
  }, [authReady, isLoggedIn, requireLogin]);

  return (
    <InspeksiPage
      requests={isLoggedIn ? app.inspeksiRequests : []}
      loading={!authReady || app.inspeksiLoading}
      onNewRequest={() => app.requestInspeksi(null)}
      onOpenListing={app.openListing}
    />
  );
}
