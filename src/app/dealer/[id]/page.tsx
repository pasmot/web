import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { dealers, getDealer } from '../../../data/dealers';
import { DealerBinding } from '../../../views/bindings/DealerBinding';

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return dealers.map((d) => ({ id: d.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const dealer = getDealer(id);
  if (!dealer) return { title: 'Dealer tidak ditemukan' };
  return {
    title: dealer.name,
    description: dealer.description,
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const dealer = getDealer(id);
  if (!dealer) notFound();
  return <DealerBinding dealer={dealer} />;
}
