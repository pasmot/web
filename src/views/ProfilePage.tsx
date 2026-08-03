import { useEffect, useState } from "react";
import { LogOut, Mail, PencilLine, Store } from "lucide-react";
import type { AuthUser } from "../hooks/useAuth";
import { fetchMe, updateMe, type MeProfile } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";

type ProfilePageProps = {
  user: AuthUser;
  savedCount: number;
  inspeksiCount: number;
  chatCount: number;
  onLogout: () => void;
  onToast?: (message: string) => void;
};

const TIER_LABELS: Record<number, string> = {
  1: "Seller Pemula",
  2: "Seller Berkembang",
  3: "Kios Terverifikasi",
};

export function ProfilePage({
  user,
  savedCount,
  inspeksiCount,
  chatCount,
  onLogout,
  onToast,
}: ProfilePageProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [profile, setProfile] = useState<MeProfile | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetchMe()
      .then((data) => {
        if (active && data) setProfile(data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  // Prefer the live profile, falling back to the token-derived identity.
  const name = profile?.user.full_name?.trim() || user.name;
  const email = profile?.user.email || user.email;
  const avatarUrl = profile?.user.avatar_url || user.avatarUrl;
  const bio = profile?.user.bio?.trim();
  const joinYear = profile?.user.created_at
    ? new Date(profile.user.created_at).getFullYear()
    : null;
  const seller = profile?.seller ?? null;

  const openEdit = () => {
    setEditName(profile?.user.full_name ?? user.name ?? "");
    setEditBio(profile?.user.bio ?? "");
    setEditOpen(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const updated = await updateMe({
        full_name: editName.trim(),
        bio: editBio.trim(),
      });
      setProfile(updated);
      setEditOpen(false);
      onToast?.("Profil berhasil diperbarui");
    } catch {
      onToast?.("Gagal memperbarui profil — coba lagi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="simple-page">
      <div className="container">
        <div className="simple-page-head">
          <h1>Profil & Akun</h1>
          <p>Kelola akun member PasarMotor kamu.</p>
        </div>

        <div className="profile-card">
          <div className="profile-card-head">
            {avatarUrl ? (
              <img
                className="profile-avatar"
                src={avatarUrl}
                alt={name}
                style={{ objectFit: "cover" }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="profile-avatar">{user.initials}</div>
            )}
            <div>
              <h2>{name}</h2>
              <div className="profile-email">
                <Mail size={14} />
                {email}
              </div>
              <div className="profile-email-note">
                Terhubung dengan akun Google — tidak bisa diubah.
              </div>
            </div>
          </div>

          {bio && <p className="profile-bio">{bio}</p>}

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

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Badge tone="success">Member aktif</Badge>
            {joinYear && <Badge>Bergabung {joinYear}</Badge>}
            {seller && (
              <Badge tone="red">
                <Store size={12} style={{ marginRight: 4 }} />
                {TIER_LABELS[seller.tier ?? 1] ?? "Seller"}
              </Badge>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            {/* <Button variant="outline" onClick={openEdit}>
              <PencilLine size={16} />
              Edit profil
            </Button> */}
            <Button variant="soft" onClick={() => setConfirmOpen(true)}>
              <LogOut size={16} />
              Keluar
            </Button>
          </div>
        </div>
      </div>

      {/* Edit profil */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} maxWidth={420}>
        <div className="form-modal">
          <h2>Edit profil</h2>
          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Nama lengkap</label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Nama kamu"
            />
          </div>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label>Bio</label>
            <textarea
              rows={3}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Ceritakan sedikit tentang kamu…"
            />
          </div>
          <div className="modal-actions" style={{ marginTop: 20 }}>
            <Button block onClick={saveEdit} disabled={saving}>
              {saving ? "Menyimpan…" : "Simpan"}
            </Button>
            <Button variant="ghost" block onClick={() => setEditOpen(false)}>
              Batal
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth={380}
      >
        <div className="login-gate">
          <h2>Keluar dari akun?</h2>
          <p style={{ marginTop: 10 }}>
            Fitur incaran, inspeksi, dan chat lanjutan akan kembali terkunci
            sampai kamu login lagi.
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
