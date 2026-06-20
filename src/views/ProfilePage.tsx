import { useState } from 'react';
import { LogOut, Mail, PencilLine } from 'lucide-react';
import type { MockUser } from '../hooks/useMockAuth';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';

type ProfilePageProps = {
  user: MockUser;
  savedCount: number;
  inspeksiCount: number;
  chatCount: number;
  onLogout: () => void;
};

export function ProfilePage({
  user,
  savedCount,
  inspeksiCount,
  chatCount,
  onLogout,
}: ProfilePageProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="simple-page">
      <div className="container">
        <div className="simple-page-head">
          <h1>Profil & Akun</h1>
          <p>Kelola akun member PasarMotor kamu.</p>
        </div>

        <div className="profile-card">
          <div className="profile-card-head">
            <div className="profile-avatar">{user.initials}</div>
            <div>
              <h2>{user.name}</h2>
              <div className="profile-email">
                <Mail size={14} />
                {user.email}
              </div>
              <div className="profile-email-note">
                Terhubung dengan akun Google — tidak bisa diubah.
              </div>
            </div>
          </div>

          <div className="profile-stats">
            <div className="profile-stat">
              <strong>{savedCount}</strong>
              <span>Incaran tersimpan</span>
            </div>
            <div className="profile-stat">
              <strong>{inspeksiCount}</strong>
              <span>Inspeksi diajukan</span>
            </div>
            <div className="profile-stat">
              <strong>{chatCount}</strong>
              <span>Pesan ke Montir AI</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Badge tone="success">Member aktif</Badge>
            <Badge>Bergabung 2026</Badge>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <Button variant="outline" onClick={() => undefined} title="Dummy">
              <PencilLine size={16} />
              Edit profil
            </Button>
            <Button variant="soft" onClick={() => setConfirmOpen(true)}>
              <LogOut size={16} />
              Keluar
            </Button>
          </div>
        </div>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth={380}>
        <div className="login-gate">
          <h2>Keluar dari akun?</h2>
          <p style={{ marginTop: 10 }}>
            Fitur incaran, inspeksi, dan chat lanjutan akan kembali terkunci sampai
            kamu login lagi.
          </p>
          <div className="modal-actions" style={{ marginTop: 22 }}>
            <Button
              block
              onClick={() => {
                setConfirmOpen(false);
                onLogout();
              }}
            >
              Ya, keluar
            </Button>
            <Button variant="ghost" block onClick={() => setConfirmOpen(false)}>
              Batal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
