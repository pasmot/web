'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { viewFromPathname } from '../../lib/routes';
import { Header } from './Header';
import { Footer } from './Footer';
import { MontirDock } from '../chat/MontirDock';
import { LoginGateModal } from '../auth/LoginGateModal';
import { InspeksiFormModal } from '../modals/InspeksiFormModal';
import { ContactSellerModal } from '../modals/ContactSellerModal';

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const view = viewFromPathname(pathname);
  const isChat = view === 'chat';
  // The catalog uses infinite scroll — a footer that keeps sliding out of reach
  // as new pages load is jarring, so drop it there too.
  const hideFooter = isChat || view === 'catalog';

  const app = useApp();
  const [atLandingHero, setAtLandingHero] = useState(true);

  // Dock morph: full bar only while the home hero is in view; mini elsewhere.
  useEffect(() => {
    if (view !== 'landing') {
      setAtLandingHero(false);
      return;
    }
    const onScroll = () => {
      const hero = document.querySelector<HTMLElement>('.hero');
      const threshold = hero ? hero.offsetTop + hero.offsetHeight - 140 : 520;
      setAtLandingHero(window.scrollY < threshold);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [view]);

  const dockMode: 'bar' | 'mini' =
    view === 'landing' && atLandingHero ? 'bar' : 'mini';

  return (
    <div className="app-shell">
      <Header
        activeView={view}
        isLoggedIn={app.isLoggedIn}
        userInitials={app.user.initials}
        savedCount={app.isLoggedIn ? app.savedIds.length : 0}
        onNavigate={app.smartNavigate}
        onOpenProfile={app.openProfile}
        onOpenSaved={app.openSaved}
        onLoginClick={app.openLogin}
      />

      <main className="app-main">{children}</main>

      {!hideFooter && <Footer onNavigate={app.smartNavigate} />}

      {!isChat && (
        <div
          className={`dock-backdrop ${
            dockMode === 'bar' || app.dockExpanded ? '' : 'backdrop-hidden'
          }`}
          aria-hidden="true"
        />
      )}

      {!isChat && (
        <MontirDock
          chat={app.chat}
          isLoggedIn={app.isLoggedIn}
          expanded={app.dockExpanded}
          mode={dockMode}
          onExpandChange={app.setDockExpanded}
          onOpenProduct={app.openProduct}
          onOpenFullChat={app.openFullChat}
        />
      )}

      <LoginGateModal
        open={app.gateOpen}
        featureName={app.gateFeature}
        onClose={app.closeGate}
        onLogin={app.handleGateLogin}
        onToken={app.handleGateToken}
      />

      <InspeksiFormModal
        open={app.inspeksiFormOpen}
        product={app.inspeksiFormProduct}
        onClose={app.closeInspeksiForm}
        onSubmit={app.submitInspeksi}
        onBrowse={() => {
          app.closeInspeksiForm();
          app.exploreCatalog();
        }}
      />

      <ContactSellerModal
        open={app.contactProduct !== null}
        product={app.contactProduct}
        onClose={app.closeContact}
      />

      <div className="toast-wrap" aria-live="polite">
        {app.toasts.map((toast) => (
          <div className={`toast toast-${toast.variant}`} key={toast.id}>
            {toast.variant === 'error' ? (
              <AlertCircle size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {toast.text}
          </div>
        ))}
      </div>
    </div>
  );
}
