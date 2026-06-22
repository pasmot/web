import { API_BASE_URL } from './api';

/**
 * Auth token handling for the PasarMotor API.
 *
 * Login is Google OAuth: redirecting to `/auth/google/login` eventually lands
 * back with a `?token=<jwt>` query param. The JWT carries the user identity
 * (user_id / email / name); authenticated requests send `Authorization: Bearer`.
 */
const TOKEN_KEY = 'pasmot_token';

// Mirror in memory so non-React modules (API client) can read it synchronously.
let memoryToken: string | null = null;

export type JwtPayload = {
  user_id?: string | number;
  email?: string;
  name?: string;
  avatar_url?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
};

/** Decodes a JWT payload, returning null if malformed or expired. */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json) as JwtPayload;
    if (typeof payload.exp === 'number' && Date.now() / 1000 >= payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (memoryToken) return memoryToken;
  try {
    memoryToken = window.localStorage.getItem(TOKEN_KEY);
  } catch {
    /* SSR / privacy mode — ignore */
  }
  return memoryToken;
}

export function setStoredToken(token: string): void {
  memoryToken = token;
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearToken(): void {
  memoryToken = null;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** Authorization header for authenticated API calls (empty when logged out). */
export function authHeaders(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const loginUrl = (): string => `${API_BASE_URL}/auth/google/login`;
