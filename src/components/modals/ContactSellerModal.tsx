import { MessageCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Product } from '../../types/product';
import { getDealer } from '../../data/dealers';
import { buildWhatsAppUrl } from '../../lib/contact';

type ContactSellerModalProps = {
  open: boolean;
  product: Product | null;
  onClose: () => void;
};

export function ContactSellerModal({ open, product, onClose }: ContactSellerModalProps) {
  if (!product) return null;

  const dealer = getDealer(product.seller);
  const message = `Halo ${dealer?.name ?? 'Penjual'}, saya tertarik dengan ${product.title} yang Anda jual di Pasar Motor. Apakah unit masih tersedia dan bisa dijadwalkan inspeksi?`;
  const waUrl = buildWhatsAppUrl(message);

  return (
    <Modal open={open} onClose={onClose} maxWidth={420}>
      <div className="wa-modal">
        <h2>Hubungi Penjual</h2>

        <div className="wa-modal-seller">
          <div className="pdp-dealer-avatar">{dealer?.initials ?? 'PM'}</div>
          <div>
            <strong>{dealer?.name ?? 'Penjual PasarMotor'}</strong>
            <small>
              <span className="wa-online-dot" />
              Online di WhatsApp · {dealer?.responseTime ?? 'Balas ±5 menit'}
            </small>
          </div>
        </div>

        <div className="form-product-pill">
          <img src={product.image} alt="" />
          <div>
            <strong>{product.title}</strong>
            <small>Produk yang ditanyakan</small>
          </div>
        </div>

        <div className="wa-message-label">Pesan yang akan dikirim:</div>
        <div className="wa-message-preview">{message}</div>

        <div className="modal-actions">
          <a href={waUrl} target="_blank" rel="noreferrer">
            <Button variant="wa" block>
              <MessageCircle size={18} />
              Chat via WhatsApp
            </Button>
          </a>
          <Button variant="ghost" block onClick={onClose}>
            Batal
          </Button>
        </div>
      </div>
    </Modal>
  );
}
