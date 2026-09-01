import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, MessageCircle, PackageSearch } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { INSPEKSI_FEE, formatRupiah } from '../../data/inspeksi';
import { buildWhatsAppUrl } from '../../lib/contact';
import { productUrl } from '../../lib/routes';
import type { Product } from '../../types/product';

type InspeksiFormModalProps = {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  /** Registers the inspection with the API; resolves with the authoritative fee. */
  onSubmit: () => Promise<{ feeAmount: number }>;
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Fee from the successful response — presence flags the success screen.
  const [successFee, setSuccessFee] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
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
            ke daftar inspeksimu dengan status <strong>menunggu</strong> · biaya{' '}
            <strong>{formatRupiah(successFee)}</strong>. Lanjutkan koordinasi jadwal
            dan lokasi lewat WhatsApp.
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

  const detail = [product.location, product.year, product.mileage]
    .filter(Boolean)
    .join(' · ');
  const link = productUrl(product.id);
  const message = `Halo PASARMOTOR, saya ingin mengajukan jasa inspeksi montir untuk unit ${product.title}${
    product.location ? ` di ${product.location}` : ''
  }. Mohon info jadwal dan lokasi inspeksinya. Terima kasih.\n\n${link}`;
  const waUrl = buildWhatsAppUrl(message);

  // Register the inspection (adds it to the user's list) while WhatsApp opens in
  // a new tab from the same click. Don't preventDefault — the anchor navigates.
  const handleWhatsApp = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { feeAmount } = await onSubmit();
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
    <Modal open={open} onClose={onClose} maxWidth={420}>
      <div className="wa-modal">
        <h2>Ajukan Inspeksi Montir</h2>
        <p>
          Montir kami akan cek mesin, rangka, CVT, kelistrikan, dokumen, dan estimasi
          biaya perbaikan. Jadwal dan lokasi dikoordinasikan lewat WhatsApp.
        </p>

        <div className="form-product-pill">
          <img src={product.image} alt="" />
          <div>
            <strong>{product.title}</strong>
            <small>{detail || 'Unit yang akan diinspeksi'}</small>
          </div>
        </div>

        {error && (
          <div className="chat-error" style={{ marginTop: 12 }}>
            <AlertCircle size={13} />
            {error}
          </div>
        )}

        <div className="modal-actions">
          <a href={waUrl} target="_blank" rel="noreferrer" onClick={handleWhatsApp}>
            <Button variant="wa" block disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin" />
                  Mengajukan…
                </>
              ) : (
                <>
                  <MessageCircle size={18} />
                  Ajukan &amp; Chat via WhatsApp · {formatRupiah(INSPEKSI_FEE)}
                </>
              )}
            </Button>
          </a>
          <Button variant="ghost" block onClick={onClose} disabled={submitting}>
            Batal
          </Button>
        </div>
      </div>
    </Modal>
  );
}
