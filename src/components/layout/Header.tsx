import { useState } from "react";
import { Bookmark, Menu, X } from "lucide-react";
import type { AppView } from "../../types/app";
import { Button } from "../ui/Button";

const navLogo = "/pm-logo-horizontal.svg";

type HeaderProps = {
  activeView: AppView;
  isLoggedIn: boolean;
  userInitials: string;
  savedCount: number;
  onNavigate: (view: AppView) => void;
  onOpenProfile: () => void;
  onOpenSaved: () => void;
  onLoginClick: () => void;
};

const PUBLIC_NAV: { view: AppView; label: string }[] = [
  { view: "catalog", label: "Jelajah" },
  { view: "chat", label: "Montir AI" },
];

const MEMBER_NAV: { view: AppView; label: string }[] = [
  { view: "landing", label: "Beranda" },
  { view: "catalog", label: "Jelajah" },
  { view: "chat", label: "Montir AI" },
  { view: "inspeksi", label: "Inspeksi" },
];

export function Header({
  activeView,
  isLoggedIn,
  userInitials,
  savedCount,
  onNavigate,
  onOpenProfile,
  onOpenSaved,
  onLoginClick,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = isLoggedIn ? MEMBER_NAV : PUBLIC_NAV;

  const navigate = (view: AppView) => {
    setMobileOpen(false);
    onNavigate(view);
  };

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <button className="header-logo" onClick={() => navigate("landing")}>
          <img src={navLogo} alt="PasarMotor" />
        </button>

        <nav className="header-nav" aria-label="Navigasi utama">
          {navItems.map((item) => (
            <button
              key={item.view}
              className={`header-nav-link ${activeView === item.view ? "active" : ""}`}
              onClick={() => navigate(item.view)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          {isLoggedIn ? (
            <>
              <button
                className="icon-btn"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenSaved();
                }}
                aria-label="Incaran"
                title="Incaran / Wishlist"
              >
                <Bookmark size={20} />
                {savedCount > 0 && (
                  <span className="header-saved-count">{savedCount}</span>
                )}
              </button>
              <button
                className="header-avatar"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenProfile();
                }}
                aria-label="Profil"
              >
                {userInitials}
              </button>
            </>
          ) : (
            <Button variant="dark" size="sm" onClick={onLoginClick}>
              Masuk
            </Button>
          )}

          <button
            className="icon-btn mobile-nav-toggle"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-nav-sheet">
          {navItems.map((item) => (
            <button
              key={item.view}
              className={`header-nav-link ${activeView === item.view ? "active" : ""}`}
              onClick={() => navigate(item.view)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
