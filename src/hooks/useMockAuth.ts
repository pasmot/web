import { useCallback, useState } from 'react';

export type MockUser = {
  name: string;
  email: string;
  initials: string;
};

const MOCK_USER: MockUser = {
  name: 'Raka Santoso',
  email: 'raka.santoso@gmail.com',
  initials: 'RS',
};

export function useMockAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = useCallback(() => setIsLoggedIn(true), []);
  const logout = useCallback(() => setIsLoggedIn(false), []);

  return { isLoggedIn, user: MOCK_USER, login, logout };
}
