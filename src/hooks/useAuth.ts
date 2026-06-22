'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  clearToken,
  decodeJwt,
  getStoredToken,
  loginUrl,
  setStoredToken,
  type JwtPayload,
} from '../lib/auth';

export type AuthUser = {
  name: string;
  email: string;
  initials: string;
  avatarUrl: string;
};

const GUEST: AuthUser = { name: '', email: '', initials: '', avatarUrl: '' };

function userFromPayload(payload: JwtPayload | null): AuthUser {
  if (!payload) return GUEST;
  const name = payload.name?.trim() || payload.email?.split('@')[0] || 'Pengguna';
  const initials =
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || 'P';
  const avatarUrl =
    typeof payload.avatar_url === 'string' ? payload.avatar_url : '';
  return { name, email: payload.email ?? '', initials, avatarUrl };
}

/**
 * Real Google-OAuth auth backed by a JWT.
 *
 * - `login()` redirects to the API's Google login (full-page).
 * - On return, the app captures `?token=` and persists it.
 * - `loginWithToken()` lets a token be set directly (manual paste fallback,
 *   since the backend currently redirects the token to its own /test page).
 */
export function useAuth() {
  const [token, setToken] = useState<string | null>(null);

  // On mount: capture the OAuth token from the redirect, else restore storage.
  // The backend returns it in the URL fragment (#token=, safer — never sent to
  // the server) but we also accept the query string (?token=) as a fallback.
  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const fromUrl = search.get('token') ?? hash.get('token');

    if (fromUrl && decodeJwt(fromUrl)) {
      setStoredToken(fromUrl);
      setToken(fromUrl);
      // Strip the token from the URL (drops the fragment entirely).
      search.delete('token');
      const qs = search.toString();
      window.history.replaceState(
        {},
        '',
        window.location.pathname + (qs ? `?${qs}` : ''),
      );
      return;
    }

    const stored = getStoredToken();
    if (stored && decodeJwt(stored)) {
      setToken(stored);
    } else if (stored) {
      clearToken(); // expired / malformed
    }
  }, []);

  const payload = token ? decodeJwt(token) : null;
  const isLoggedIn = payload !== null;
  const user = userFromPayload(payload);

  const login = useCallback(() => {
    // Tell the backend to send the token back to this app (token arrives in the
    // URL fragment). return_to must be an origin registered in FRONTEND_URLS.
    const returnTo = encodeURIComponent(window.location.origin + '/');
    window.location.href = `${loginUrl()}?return_to=${returnTo}`;
  }, []);

  const loginWithToken = useCallback((raw: string): boolean => {
    const t = raw.trim();
    if (!t || !decodeJwt(t)) return false;
    setStoredToken(t);
    setToken(t);
    return true;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
  }, []);

  return { isLoggedIn, user, token, login, loginWithToken, logout };
}
