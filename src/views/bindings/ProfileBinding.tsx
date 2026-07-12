'use client';

import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProfilePage } from '../ProfilePage';
import { LandingBinding } from './LandingBinding';

export function ProfileBinding() {
  const app = useApp();
  const { isLoggedIn, authReady, requireLogin } = app;

  // Profil is a member feature — gate direct visits, show landing behind it.
  // Wait for authReady so a logged-in user isn't flashed the gate/landing
  // before the stored token restores.
  useEffect(() => {
    if (authReady && !isLoggedIn) requireLogin({ kind: 'profile' });
  }, [authReady, isLoggedIn, requireLogin]);

  // While the token is still restoring, render nothing rather than flashing
  // the landing page or a guest-shaped profile.
  if (!isLoggedIn) return authReady ? <LandingBinding /> : null;

  return (
    <ProfilePage
      user={app.user}
      savedCount={app.savedIds.length}
      inspeksiCount={app.inspeksiRequests.length}
      chatCount={app.chat.userMessageCount}
      onLogout={app.handleLogout}
      onToast={app.pushToast}
    />
  );
}
