'use client';

import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProfilePage } from '../ProfilePage';
import { LandingBinding } from './LandingBinding';

export function ProfileBinding() {
  const app = useApp();
  const { isLoggedIn, requireLogin } = app;

  // Profil is a member feature — gate direct visits, show landing behind it.
  useEffect(() => {
    if (!isLoggedIn) requireLogin({ kind: 'profile' });
  }, [isLoggedIn, requireLogin]);

  if (!isLoggedIn) return <LandingBinding />;

  return (
    <ProfilePage
      user={app.user}
      savedCount={app.savedIds.length}
      inspeksiCount={app.inspeksiRequests.length}
      chatCount={app.chat.userMessageCount}
      onLogout={app.handleLogout}
    />
  );
}
