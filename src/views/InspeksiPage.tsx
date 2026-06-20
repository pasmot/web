import { useState } from 'react';
import { Plus, Wrench } from 'lucide-react';
import type { InspeksiRequest, InspeksiStatus } from '../types/app';
import { getProduct } from '../data/products';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

type InspeksiPageProps = {
  requests: InspeksiRequest[];
  onNewRequest: () => void;
};

const STATUS_TONE: Record<InspeksiStatus, 'warning' | 'info' | 'success' | 'neutral'> = {
  menunggu: 'warning',
  dijadwalkan: 'info',
  selesai: 'success',
  dibatalkan: 'neutral',
};

const STATUS_LABEL: Record<InspeksiStatus, string> = {
  menunggu: 'Menunggu',
  dijadwalkan: 'Dijadwalkan',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
};

export function InspeksiPage({ requests, onNewRequest }: InspeksiPageProps) {
  const [tab, setTab] = useState<'aktif' | 'riwayat'>('aktif');

  const active = requests.filter(
    (r) => r.status === 'menunggu' || r.status === 'dijadwalkan',
  );
  const history = requests.filter(
    (r) => r.status === 'selesai' || r.status === 'dibatalkan',
  );
  const list = tab === 'aktif' ? active : history;

  return (
    <div className="simple-page">
      <div className="container">
        <div
          className="simple-page-head"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1>Jasa Inspeksi Montir</h1>
            <p>
              Pantau permintaan inspeksi unitmu — montir cek mesin, rangka, CVT,
              kelistrikan, dan dokumen.
            </p>
          </div>
          <Button onClick={onNewRequest}>
            <Plus size={17} />
            Ajukan Inspeksi
          </Button>
        </div>

        <div className="inspeksi-tabs">
          <button
            className={`category-chip ${tab === 'aktif' ? 'active' : ''}`}
            onClick={() => setTab('aktif')}
          >
            Aktif ({active.length})
          </button>
          <button
            className={`category-chip ${tab === 'riwayat' ? 'active' : ''}`}
            onClick={() => setTab('riwayat')}
          >
            Riwayat ({history.length})
          </button>
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon={<Wrench size={26} />}
            title={tab === 'aktif' ? 'Belum ada inspeksi aktif' : 'Belum ada riwayat'}
            description={
              tab === 'aktif'
                ? 'Ajukan inspeksi dari halaman produk atau lewat tombol di atas saat kamu sudah cocok dengan unit.'
                : 'Inspeksi yang selesai atau dibatalkan akan muncul di sini.'
            }
            action={
              tab === 'aktif' ? (
                <Button onClick={onNewRequest}>Ajukan Inspeksi</Button>
              ) : undefined
            }
          />
        ) : (
          <div className="inspeksi-list">
            {list.map((req) => {
              const product = getProduct(req.productId);
              if (!product) return null;
              return (
                <div className="inspeksi-card" key={req.id}>
                  <img src={product.image} alt="" />
                  <div className="inspeksi-card-info">
                    <strong>{product.title}</strong>
                    <small>
                      {req.schedule} · {req.location}
                    </small>
                    <small>Montir: PasarMotor · Rp. 299.000</small>
                  </div>
                  <Badge tone={STATUS_TONE[req.status]}>
                    {STATUS_LABEL[req.status]}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
