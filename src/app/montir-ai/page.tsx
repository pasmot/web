import type { Metadata } from 'next';
import { ChatBinding } from '../../views/bindings/ChatBinding';

export const metadata: Metadata = {
  title: 'Montir AI',
  description:
    'Tanya Montir AI: rekomendasi motor sesuai budget, cek risiko unit bekas, dan saran kapan perlu inspeksi.',
};

export default function Page() {
  return <ChatBinding />;
}
