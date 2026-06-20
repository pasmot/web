'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { AppView, InspeksiRequest, PendingAction } from './types/app';
import type { Product, ProductCategory } from './types/product';
import { getProduct } from './data/products';
import { getDealer } from './data/dealers';
import { useMockAuth } from './hooks/useMockAuth';
import { useMontirChat } from './hooks/useMontirChat';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MontirDock } from './components/chat/MontirDock';
import { LoginGateModal } from './components/auth/LoginGateModal';
import { InspeksiFormModal } from './components/modals/InspeksiFormModal';
import { ContactSellerModal } from './components/modals/ContactSellerModal';
import { LandingPage } from './views/LandingPage';
import { CatalogPage } from './views/CatalogPage';
import { ProductDetailPage } from './views/ProductDetailPage';
import { DealerPage } from './views/DealerPage';
import { ChatPage } from './views/ChatPage';
import { SavedPage } from './views/SavedPage';
import { ProfilePage } from './views/ProfilePage';
import { InspeksiPage } from './views/InspeksiPage';

const FEATURE_NAMES: Record<string, string> = {
  wishlist: 'Incaran / Wishlist',
  'saved-view': 'Incaran / Wishlist',
  profile: 'Profil & Akun',
  inspeksi: 'Jasa Inspeksi',
  'contact-seller': 'Chat WhatsApp Penjual',
  'chat-continue': 'Chat Montir AI Lanjutan',
};

type Toast = { id: number; text: string };

function readViewFromUrl(): AppView {
  const view = new URLSearchParams(window.location.search).get('view');
  const valid: AppView[] = [
    'landing',
    'catalog',
    'product-detail',
    'dealer',
    'chat',
    'saved',
    'profile',
    'inspeksi',
  ];
  return valid.includes(view as AppView) ? (view as AppView) : 'landing';
}

let toastCounter = 0;
let inspeksiCounter = 0;

export default function App() {
  const { isLoggedIn, user, login, logout } = useMockAuth();

  const [view, setView] = useState<AppView>(readViewFromUrl);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);
  const [catalogCategory, setCatalogCategory] = useState<ProductCategory | null>(null);
  const [catalogQuery, setCatalogQuery] = useState('');

  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [inspeksiRequests, setInspeksiRequests] = useState<InspeksiRequest[]>([]);

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateFeature, setGateFeature] = useState<string | null>(null);

  const [inspeksiFormOpen, setInspeksiFormOpen] = useState(false);
  const [inspeksiFormProduct, setInspeksiFormProduct] = useState<Product | null>(null);
  const [contactProduct, setContactProduct] = useState<Product | null>(null);

  const [dockExpanded, setDockExpanded] = useState(false);
  const [atLandingHero, setAtLandingHero] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Dock morph: full bar only while the home hero is in view; mini elsewhere.
  useEffect(() => {
    if (view !== 'landing') return;
    const onScroll = () => {
      const hero = document.querySelector<HTMLElement>('.hero');
      const threshold = hero
        ? hero.offsetTop + hero.offsetHeight - 140
        : 520;
      setAtLandingHero(window.scrollY < threshold);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [view]);

  const dockMode: 'bar' | 'mini' =
    view === 'landing' && atLandingHero ? 'bar' : 'mini';

  const pushToast = useCallback((text: string) => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, text }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  /* ---------- Chat (shared between dock & full view) ---------- */

  const onChatGateHit = useCallback((pendingMessage: string) => {
    setPendingAction({ kind: 'chat-continue', message: pendingMessage });
    setGateFeature(FEATURE_NAMES['chat-continue']);
    setGateOpen(true);
  }, []);

  const chat = useMontirChat({ isLoggedIn, onGateHit: onChatGateHit });

  /* ---------- Navigation ---------- */

  const navigate = useCallback((next: AppView) => {
    setView(next);
    const url = new URL(window.location.href);
    if (next === 'landing') {
      url.searchParams.delete('view');
    } else {
      url.searchParams.set('view', next);
    }
    window.history.replaceState(null, '', url);
    window.scrollTo({ top: 0 });
  }, []);

  const openProduct = useCallback(
    (product: Product) => {
      setSelectedProductId(product.id);
      setDockExpanded(false);
      navigate('product-detail');
    },
    [navigate],
  );

  const openDealer = useCallback(
    (dealerId: string) => {
      setSelectedDealerId(dealerId);
      navigate('dealer');
    },
    [navigate],
  );

  const exploreCatalog = useCallback(
    (category?: ProductCategory, query?: string) => {
      setCatalogCategory(category ?? null);
      setCatalogQuery(query ?? '');
      navigate('catalog');
    },
    [navigate],
  );

  /* ---------- Login gate orchestration ---------- */

  const requireLogin = useCallback(
    (action: NonNullable<PendingAction>) => {
      setPendingAction(action);
      setGateFeature(FEATURE_NAMES[action.kind] ?? null);
      setGateOpen(true);
    },
    [],
  );

  const executeAction = useCallback(
    (action: NonNullable<PendingAction>) => {
      switch (action.kind) {
        case 'wishlist': {
          setSavedIds((prev) =>
            prev.includes(action.productId) ? prev : [...prev, action.productId],
          );
          pushToast('Tersimpan ke Incaran');
          break;
        }
        case 'profile':
          navigate('profile');
          break;
        case 'saved-view':
          navigate('saved');
          break;
        case 'inspeksi': {
          setInspeksiFormProduct(
            action.productId ? (getProduct(action.productId) ?? null) : null,
          );
          setInspeksiFormOpen(true);
          break;
        }
        case 'contact-seller': {
          const product = getProduct(action.productId);
          if (product) setContactProduct(product);
          break;
        }
        case 'chat-continue':
          chat.sendMessage(action.message);
          break;
      }
    },
    [chat, navigate, pushToast],
  );

  // pending…AfterAuth: run the deferred action once login lands.
  const pendingRef = useRef<PendingAction>(null);
  pendingRef.current = pendingAction;

  useEffect(() => {
    if (isLoggedIn && pendingRef.current) {
      const action = pendingRef.current;
      setPendingAction(null);
      executeAction(action);
    }
  }, [isLoggedIn, executeAction]);

  const handleGateLogin = useCallback(() => {
    setGateOpen(false);
    setGateFeature(null);
    login();
    pushToast('Berhasil masuk — selamat datang!');
  }, [login, pushToast]);

  const closeGate = useCallback(() => {
    setGateOpen(false);
    setGateFeature(null);
    setPendingAction(null);
  }, []);

  /* ---------- Tier-2 triggers ---------- */

  const toggleSave = useCallback(
    (product: Product) => {
      if (!isLoggedIn) {
        requireLogin({ kind: 'wishlist', productId: product.id });
        return;
      }
      setSavedIds((prev) => {
        if (prev.includes(product.id)) {
          pushToast('Dihapus dari Incaran');
          return prev.filter((id) => id !== product.id);
        }
        pushToast('Tersimpan ke Incaran');
        return [...prev, product.id];
      });
    },
    [isLoggedIn, requireLogin, pushToast],
  );

  const openProfile = useCallback(() => {
    if (!isLoggedIn) {
      requireLogin({ kind: 'profile' });
      return;
    }
    navigate('profile');
  }, [isLoggedIn, requireLogin, navigate]);

  const openSaved = useCallback(() => {
    if (!isLoggedIn) {
      requireLogin({ kind: 'saved-view' });
      return;
    }
    navigate('saved');
  }, [isLoggedIn, requireLogin, navigate]);

  const requestInspeksi = useCallback(
    (product: Product | null) => {
      if (!isLoggedIn) {
        requireLogin({ kind: 'inspeksi', productId: product?.id ?? null });
        return;
      }
      setInspeksiFormProduct(product);
      setInspeksiFormOpen(true);
    },
    [isLoggedIn, requireLogin],
  );

  const contactSeller = useCallback(
    (product: Product) => {
      if (!isLoggedIn) {
        requireLogin({ kind: 'contact-seller', productId: product.id });
        return;
      }
      setContactProduct(product);
    },
    [isLoggedIn, requireLogin],
  );

  /** Navigation that respects Tier-2 gates for saved/profile views. */
  const smartNavigate = useCallback(
    (next: AppView) => {
      if (next === 'saved') {
        openSaved();
        return;
      }
      if (next === 'profile') {
        openProfile();
        return;
      }
      navigate(next);
    },
    [navigate, openSaved, openProfile],
  );

  /**
   * Expanding the dock on a PDP automatically starts the product-advice
   * conversation (replaces the old "Tanya Montir AI" PDP button).
   * Only auto-triggers once per product so a cleared context stays cleared.
   */
  const autoContextRef = useRef<string | null>(null);

  const handleDockExpandChange = useCallback(
    (expanded: boolean) => {
      setDockExpanded(expanded);
      if (!expanded || view !== 'product-detail' || !selectedProductId) return;
      if (autoContextRef.current === selectedProductId) return;
      const product = getProduct(selectedProductId);
      if (product) {
        autoContextRef.current = selectedProductId;
        chat.openWithProduct(product);
      }
    },
    [view, selectedProductId, chat],
  );

  const submitInspeksi = useCallback(
    (data: { productId: string; schedule: string; location: string; note: string }) => {
      const request: InspeksiRequest = {
        id: `inspeksi-${++inspeksiCounter}`,
        productId: data.productId,
        schedule: data.schedule,
        location: data.location,
        note: data.note,
        status: 'menunggu',
        createdAt: 'Hari ini',
      };
      setInspeksiRequests((prev) => [request, ...prev]);
    },
    [],
  );

  const handleLogout = useCallback(() => {
    logout();
    navigate('landing');
    pushToast('Kamu sudah keluar dari akun.');
  }, [logout, navigate, pushToast]);

  /* ---------- View rendering ---------- */

  const selectedProduct = selectedProductId ? getProduct(selectedProductId) : undefined;
  const selectedDealer = selectedDealerId ? getDealer(selectedDealerId) : undefined;

  const renderView = () => {
    switch (view) {
      case 'catalog':
        return (
          <CatalogPage
            key={`${catalogCategory ?? 'semua'}-${catalogQuery}`}
            savedIds={savedIds}
            initialCategory={catalogCategory}
            initialQuery={catalogQuery}
            onOpenProduct={openProduct}
            onToggleSave={toggleSave}
          />
        );
      case 'product-detail':
        if (!selectedProduct) {
          return (
            <CatalogPage
              savedIds={savedIds}
              initialCategory={null}
              initialQuery=""
              onOpenProduct={openProduct}
              onToggleSave={toggleSave}
            />
          );
        }
        return (
          <ProductDetailPage
            product={selectedProduct}
            savedIds={savedIds}
            onBackToCatalog={() => exploreCatalog()}
            onOpenProduct={openProduct}
            onToggleSave={toggleSave}
            onRequestInspeksi={(p) => requestInspeksi(p)}
            onContactSeller={contactSeller}
            onOpenDealer={openDealer}
          />
        );
      case 'dealer':
        if (!selectedDealer) {
          return (
            <CatalogPage
              savedIds={savedIds}
              initialCategory={null}
              initialQuery=""
              onOpenProduct={openProduct}
              onToggleSave={toggleSave}
            />
          );
        }
        return (
          <DealerPage
            dealer={selectedDealer}
            savedIds={savedIds}
            onOpenProduct={openProduct}
            onToggleSave={toggleSave}
          />
        );
      case 'chat':
        return <ChatPage chat={chat} isLoggedIn={isLoggedIn} onOpenProduct={openProduct} />;
      case 'saved':
        if (!isLoggedIn) {
          return (
            <SavedPage
              savedIds={[]}
              onOpenProduct={openProduct}
              onToggleSave={toggleSave}
              onExploreCatalog={() => exploreCatalog()}
            />
          );
        }
        return (
          <SavedPage
            savedIds={savedIds}
            onOpenProduct={openProduct}
            onToggleSave={toggleSave}
            onExploreCatalog={() => exploreCatalog()}
          />
        );
      case 'profile':
        if (!isLoggedIn) {
          return (
            <LandingPage
              savedIds={savedIds}
              onExploreCatalog={exploreCatalog}
              onOpenChat={() => setDockExpanded(true)}
              onOpenProduct={openProduct}
              onToggleSave={toggleSave}
              onOpenDealer={openDealer}
              onOpenInspeksi={() => requestInspeksi(null)}
            />
          );
        }
        return (
          <ProfilePage
            user={user}
            savedCount={savedIds.length}
            inspeksiCount={inspeksiRequests.length}
            chatCount={chat.userMessageCount}
            onLogout={handleLogout}
          />
        );
      case 'inspeksi':
        return (
          <InspeksiPage
            requests={inspeksiRequests}
            onNewRequest={() => requestInspeksi(null)}
          />
        );
      case 'landing':
      default:
        return (
          <LandingPage
            savedIds={savedIds}
            onExploreCatalog={exploreCatalog}
            onOpenChat={() => setDockExpanded(true)}
            onOpenProduct={openProduct}
            onToggleSave={toggleSave}
            onOpenDealer={openDealer}
            onOpenInspeksi={() => requestInspeksi(null)}
          />
        );
    }
  };

  return (
    <div className="app-shell">
      <Header
        activeView={view}
        isLoggedIn={isLoggedIn}
        userInitials={user.initials}
        savedCount={isLoggedIn ? savedIds.length : 0}
        onNavigate={smartNavigate}
        onOpenProfile={openProfile}
        onOpenSaved={openSaved}
        onLoginClick={() => {
          setGateFeature(null);
          setGateOpen(true);
        }}
      />

      <main className="app-main" key={view}>
        {renderView()}
      </main>

      {view !== 'chat' && <Footer onNavigate={smartNavigate} />}

      {view !== 'chat' && (
        <div
          className={`dock-backdrop ${
            dockMode === 'bar' || dockExpanded ? '' : 'backdrop-hidden'
          }`}
          aria-hidden="true"
        />
      )}

      {view !== 'chat' && (
        <MontirDock
          chat={chat}
          isLoggedIn={isLoggedIn}
          expanded={dockExpanded}
          mode={dockMode}
          onExpandChange={handleDockExpandChange}
          onOpenProduct={openProduct}
          onOpenFullChat={() => {
            setDockExpanded(false);
            navigate('chat');
          }}
        />
      )}

      <LoginGateModal
        open={gateOpen}
        featureName={gateFeature}
        onClose={closeGate}
        onLogin={handleGateLogin}
      />

      <InspeksiFormModal
        open={inspeksiFormOpen}
        product={inspeksiFormProduct}
        onClose={() => setInspeksiFormOpen(false)}
        onSubmit={submitInspeksi}
      />

      <ContactSellerModal
        open={contactProduct !== null}
        product={contactProduct}
        onClose={() => setContactProduct(null)}
      />

      <div className="toast-wrap" aria-live="polite">
        {toasts.map((toast) => (
          <div className="toast" key={toast.id}>
            <CheckCircle2 size={16} />
            {toast.text}
          </div>
        ))}
      </div>
    </div>
  );
}
