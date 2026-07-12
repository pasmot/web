import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, PackageSearch } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ProductImage } from '../ui/ProductImage';
import { INSPEKSI_FEE, formatRupiah } from '../../data/inspeksi';
import type { Product } from '../../types/product';

type InspeksiFormModalProps = {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  /** Submits to the API; resolves with the authoritative fee or rejects. */
  onSubmit: (data: {
    scheduledDate: string;
    meetingLocation: string;
    notes: string;
  }) => Promise<{ feeAmount: number }>;
  /** Sends the user to browse listings when no inspectable unit is set. */
  onBrowse: () => void;
};

export function InspeksiFormModal({
  open,
  product,
  onClose,
  onSubmit,
  onBrowse,
}: InspeksiFormModalProps) {
  const [schedule, setSchedule] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Fee from the successful response — presence flags the success screen.
  const [successFee, setSuccessFee] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setSchedule('');
      setLocation('');
      setNote('');
      setSubmitting(false);
      setError(null);
      setSuccessFee(null);
    }
  }, [open, product]);

  // Inspection targets a real listing (needs its internal id). Static/mock
  // products (and the generic "Ajukan Inspeksi" entry) have none.
  const canInspect = product?.internalId != null;

  if (successFee != null) {
    return (
      <Modal open={open} onClose={onClose} maxWidth={400}>
        <div className="modal-success">
          <div className="modal-success-icon">
            <CheckCircle2 size={30} />
          </div>
          <h2>Inspeksi berhasil diajukan</h2>
          <p>
            Permintaan inspeksi untuk <strong>{product?.title}</strong> sudah masuk
            dengan status <strong>menunggu</strong> · biaya{' '}
            <strong>{formatRupiah(successFee)}</strong>. Montir kami akan
            menghubungimu.
          </p>
          <div className="modal-actions" style={{ marginTop: 20 }}>
            <Button variant="dark" block onClick={onClose}>
              Selesai
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // No inspectable unit — guide the user to pick a listing from the catalog.
  if (!canInspect) {
    return (
      <Modal open={open} onClose={onClose} maxWidth={400}>
        <div className="modal-success">
          <div className="modal-success-icon" style={{ background: 'var(--color-surface-soft)' }}>
            <PackageSearch size={28} />
          </div>
          <h2>Pilih unit dulu</h2>
          <p>
            Inspeksi diajukan untuk satu listing tertentu. Buka listing yang kamu
            minati di Pasar, lalu tekan <strong>Ajukan Inspeksi</strong> di halaman
            produknya.
          </p>
          <div className="modal-actions" style={{ marginTop: 20 }}>
            <Button variant="dark" block onClick={onBrowse}>
              Telusuri Pasar
            </Button>
            <Button variant="ghost" block onClick={onClose}>
              Batal
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { feeAmount } = await onSubmit({
        scheduledDate: schedule,
        meetingLocation: location,
        notes: note,
      });
      setSuccessFee(feeAmount);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal mengajukan inspeksi.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth={440}>
      <form className="form-modal" onSubmit={handleSubmit}>
        <h2>Ajukan Inspeksi Montir</h2>
        <p>
          Montir akan cek mesin, rangka, CVT, kelistrikan, dokumen, dan estimasi biaya
          perbaikan.
        </p>

        <div className="form-product-pill">
          <ProductImage src={product.image} alt="" compact />
          <div>
            <strong>{product.title}</strong>
            <small>
              {[product.location, product.year, product.mileage]
                .filter(Boolean)
                .join(' · ')}
            </small>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="inspeksi-jadwal">Jadwal inspeksi</label>
          <input
            id="inspeksi-jadwal"
            type="date"
            required
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="inspeksi-lokasi">Lokasi bertemu</label>
          <input
            id="inspeksi-lokasi"
            type="text"
            required
            placeholder="cth. Showroom dealer, Jakarta Selatan"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="inspeksi-catatan">Catatan untuk montir (opsional)</label>
          <textarea
            id="inspeksi-catatan"
            placeholder="cth. Tolong fokus cek suara CVT dan bekas repaint"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {error && (
          <div className="chat-error" style={{ marginTop: 4 }}>
            <AlertCircle size={13} />
            {error}
          </div>
        )}

        <div className="modal-actions">
          <Button type="submit" block disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={16} className="spin" />
                Mengajukan…
              </>
            ) : (
              `Ajukan Inspeksi · ${formatRupiah(INSPEKSI_FEE)}`
            )}
          </Button>
          <Button type="button" variant="ghost" block onClick={onClose} disabled={submitting}>
            Batal
          </Button>
        </div>
      </form>
    </Modal>
  );
}
