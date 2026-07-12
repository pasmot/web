import { useState } from 'react';
import { Plus, Wrench } from 'lucide-react';
import type { Inspection } from '../lib/api';
import { formatRupiah } from '../data/inspeksi';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ProductImage } from '../components/ui/ProductImage';

type InspeksiPageProps = {
  requests: Inspection[];
  loading: boolean;
  onNewRequest: () => void;
  onOpenListing: (publicId: string) => void;
};

type Tone = 'warning' | 'info' | 'success' | 'neutral';

// API status is 'pending' for now; map the known ones and tolerate the rest.
const STATUS_META: Record<string, { tone: Tone; label: string }> = {
  pending: { tone: 'warning', label: 'Menunggu' },
  scheduled: { tone: 'info', label: 'Dijadwalkan' },
  completed: { tone: 'success', label: 'Selesai' },
  cancelled: { tone: 'neutral', label: 'Dibatalkan' },
};

const statusMeta = (status: string): { tone: Tone; label: string } =>
  STATUS_META[status] ?? { tone: 'neutral', label: status };

const ACTIVE_STATUSES = new Set(['pending', 'scheduled']);

/** Format an ISO/date string as a readable id-ID date; fall back to raw. */
function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function InspeksiPage({
  requests,
  loading,
  onNewRequest,
  onOpenListing,
}: InspeksiPageProps) {
  const [tab, setTab] = useState<'aktif' | 'riwayat'>('aktif');

  const active = requests.filter((r) => ACTIVE_STATUSES.has(r.status));
  const history = requests.filter((r) => !ACTIVE_STATUSES.has(r.status));
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

        {loading ? (
          <div className="inspeksi-list">
            {Array.from({ length: 2 }, (_, i) => (
              <div className="inspeksi-card" key={i}>
                <div className="skeleton" style={{ width: 64, height: 64, borderRadius: 12 }} />
                <div className="inspeksi-card-info" style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 15, width: '60%' }} />
                  <div className="skeleton" style={{ height: 12, width: '80%', marginTop: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: '40%', marginTop: 6 }} />
                </div>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
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
              const { tone, label } = statusMeta(req.status);
              const clickable = Boolean(req.listingPublicId);
              return (
                <div
                  className="inspeksi-card"
                  key={req.id}
                  onClick={
                    clickable
                      ? () => onOpenListing(req.listingPublicId as string)
                      : undefined
                  }
                  role={clickable ? 'button' : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  style={clickable ? { cursor: 'pointer' } : undefined}
                >
                  <ProductImage src={req.image} alt="" compact />
                  <div className="inspeksi-card-info">
                    <strong>{req.title}</strong>
                    <small>
                      {formatDate(req.scheduledDate)} · {req.meetingLocation}
                    </small>
                    <small>Montir: PasarMotor · {formatRupiah(req.feeAmount)}</small>
                  </div>
                  <Badge tone={tone}>{label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
