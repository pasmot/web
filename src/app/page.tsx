'use client';

import dynamic from 'next/dynamic';

// The original project is a fully client-rendered SPA (state-based routing that
// reads window.location on first render), so we render it client-only to match
// the exact same behaviour and avoid SSR window access.
const App = dynamic(() => import('../App'), { ssr: false });

export default function Page() {
  return <App />;
}
