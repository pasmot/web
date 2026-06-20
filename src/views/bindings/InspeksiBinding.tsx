'use client';

import { useApp } from '../../context/AppContext';
import { InspeksiPage } from '../InspeksiPage';

export function InspeksiBinding() {
  const app = useApp();
  return (
    <InspeksiPage
      requests={app.inspeksiRequests}
      onNewRequest={() => app.requestInspeksi(null)}
    />
  );
}
