import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

type LoginGateModalProps = {
  open: boolean;
  featureName: string | null;
  onClose: () => void;
  onLogin: () => void;
  /** Manual token paste fallback — returns false if the token is invalid. */
  onToken: (token: string) => boolean;
};

const GOOGLE_ICON =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>`,
  );

export function LoginGateModal({
  open,
  featureName,
  onClose,
  onLogin,
  onToken,
}: LoginGateModalProps) {
  const [showToken, setShowToken] = useState(false);
  const [tokenValue, setTokenValue] = useState('');
  const [tokenError, setTokenError] = useState(false);

  const submitToken = () => {
    if (!onToken(tokenValue)) {
      setTokenError(true);
      return;
    }
    setTokenValue('');
    setTokenError(false);
    setShowToken(false);
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth={400}>
      <div className="login-gate">
        <img
          className="login-gate-logo"
          src="/brand/pm-logo-stacked.png"
          alt="PasarMotor"
        />
        <h2>Masuk ke PasarMotor</h2>
        {featureName && (
          <div className="login-gate-feature">
            <Badge tone="red">{featureName}</Badge>
          </div>
        )}
        <p>
          Login dulu untuk lanjut — setelah masuk, aksi kamu otomatis diteruskan tanpa
          mengulang dari awal.
        </p>
        <button className="google-btn" onClick={onLogin}>
          <img src={GOOGLE_ICON} alt="" />
          Login dengan Google
        </button>

        {!showToken ? (
          <button
            type="button"
            className="login-gate-link"
            onClick={() => setShowToken(true)}
          >
            Punya token? Masuk manual
          </button>
        ) : (
          <div className="login-gate-token">
            <textarea
              rows={3}
              placeholder="Tempel JWT token di sini…"
              value={tokenValue}
              onChange={(e) => {
                setTokenValue(e.target.value);
                setTokenError(false);
              }}
              className={tokenError ? 'invalid' : ''}
            />
            {tokenError && (
              <span className="login-gate-token-err">
                Token tidak valid atau sudah kedaluwarsa.
              </span>
            )}
            <button
              className="google-btn"
              onClick={submitToken}
              disabled={!tokenValue.trim()}
            >
              Masuk dengan token
            </button>
          </div>
        )}

        <p className="login-gate-terms">
          Autentikasi via Google OAuth — token disimpan di perangkat kamu.
        </p>
      </div>
    </Modal>
  );
}
