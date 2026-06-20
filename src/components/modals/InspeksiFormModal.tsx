import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { products } from '../../data/products';
import type { Product } from '../../types/product';

type InspeksiFormModalProps = {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSubmit: (data: {
    productId: string;
    schedule: string;
    location: string;
    note: string;
  }) => void;
};

const motorOptions = products.filter((p) => p.category === 'motor');

export function InspeksiFormModal({
  open,
  product,
  onClose,
  onSubmit,
}: InspeksiFormModalProps) {
  const [productId, setProductId] = useState(product?.id ?? motorOptions[0].id);
  const [schedule, setSchedule] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setProductId(product?.id ?? motorOptions[0].id);
      setSubmitted(false);
      setSchedule('');
      setLocation('');
      setNote('');
    }
  }, [open, product]);

  const selected = motorOptions.find((p) => p.id === productId) ?? motorOptions[0];

  if (submitted) {
    return (
      <Modal open={open} onClose={onClose} maxWidth={400}>
        <div className="modal-success">
          <div className="modal-success-icon">
            <CheckCircle2 size={30} />
          </div>
          <h2>Inspeksi berhasil diajukan</h2>
          <p>
            Permintaan inspeksi untuk <strong>{selected.title}</strong> sudah masuk
            dengan status <strong>menunggu</strong>. Montir kami akan menghubungimu.
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

  return (
    <Modal open={open} onClose={onClose} maxWidth={440}>
      <form
        className="form-modal"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ productId, schedule, location, note });
          setSubmitted(true);
        }}
      >
        <h2>Ajukan Inspeksi Montir</h2>
        <p>
          Montir akan cek mesin, rangka, CVT, kelistrikan, dokumen, dan estimasi biaya
          perbaikan.
        </p>

        <div className="form-product-pill">
          <img src={selected.image} alt="" />
          <div>
            <strong>{selected.title}</strong>
            <small>
              {selected.location} · {selected.year} · {selected.mileage}
            </small>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="inspeksi-unit">Unit yang diinspeksi</label>
          <select
            id="inspeksi-unit"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            {motorOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} — {p.location}
              </option>
            ))}
          </select>
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

        <div className="modal-actions">
          <Button type="submit" block>
            Ajukan Inspeksi · Rp. 299.000
          </Button>
          <Button type="button" variant="ghost" block onClick={onClose}>
            Batal
          </Button>
        </div>
      </form>
    </Modal>
  );
}
