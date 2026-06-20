'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { AppView, InspeksiRequest, PendingAction } from '../types/app';
import type { Product, ProductCategory } from '../types/product';
import { getProduct } from '../data/products';
import { useMockAuth, type MockUser } from '../hooks/useMockAuth';
import { useMontirChat, type MontirChat } from '../hooks/useMontirChat';
import { useRouter } from 'next/navigation';
import { VIEW_PATHS, productPath, dealerPath, catalogPath } from '../lib/routes';

const FEATURE_NAMES: Record<string, string> = {
  wishlist: 'Incaran / Wishlist',
  'saved-view': 'Incaran / Wishlist',
  profile: 'Profil & Akun',
  inspeksi: 'Jasa Inspeksi',
  'contact-seller': 'Chat WhatsApp Penjual',
  'chat-continue': 'Chat Montir AI Lanjutan',
};

export type Toast = { id: number; text: string };

let toastCounter = 0;
let inspeksiCounter = 0;

type AppContextValue = {
  isLoggedIn: boolean;
  user: MockUser;
  savedIds: string[];
  inspeksiRequests: InspeksiRequest[];
  chat: MontirChat;

  // dock
  dockExpanded: boolean;
  setDockExpanded: (expanded: boolean) => void;
  /** PDP registers its product so expanding the dock starts product-advice. */
  setActiveProduct: (product: Product | null) => void;

  // navigation
  navigate: (view: AppView) => void;
  smartNavigate: (view: AppView) => void;
  openProduct: (product: Product) => void;
  openDealer: (dealerId: string) => void;
  exploreCatalog: (category?: ProductCategory, query?: string) => void;
  openFullChat: () => void;

  // tier-2 (gated) actions
  toggleSave: (product: Product) => void;
  requestInspeksi: (product: Product | null) => void;
  contactSeller: (product: Product) => void;
  openSaved: () => void;
  openProfile: () => void;
  requireLogin: (action: NonNullable<PendingAction>) => void;
  handleLogout: () => void;

  // login gate modal
  gateOpen: boolean;
  gateFeature: string | null;
  openLogin: () => void;
  closeGate: () => void;
  handleGateLogin: () => void;

  // inspeksi form modal
  inspeksiFormOpen: boolean;
  inspeksiFormProduct: Product | null;
  closeInspeksiForm: () => void;
  submitInspeksi: (data: {
    productId: string;
    schedule: string;
    location: string;
    note: string;
  }) => void;

  // contact seller modal
  contactProduct: Product | null;
  closeContact: () => void;

  // toasts
  toasts: Toast[];
  pushToast: (text: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <AppProvider>');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isLoggedIn, user, login, logout } = useMockAuth();

  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [inspeksiRequests, setInspeksiRequests] = useState<InspeksiRequest[]>([]);

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateFeature, setGateFeature] = useState<string | null>(null);

  const [inspeksiFormOpen, setInspeksiFormOpen] = useState(false);
  const [inspeksiFormProduct, setInspeksiFormProduct] = useState<Product | null>(null);
  const [contactProduct, setContactProduct] = useState<Product | null>(null);

  const [dockExpanded, setDockExpandedState] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

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

  const navigate = useCallback(
    (next: AppView) => {
      router.push(VIEW_PATHS[next as keyof typeof VIEW_PATHS] ?? '/');
    },
    [router],
  );

  const openProduct = useCallback(
    (product: Product) => {
      setDockExpandedState(false);
      router.push(productPath(product.id));
    },
    [router],
  );

  const openDealer = useCallback(
    (dealerId: string) => {
      router.push(dealerPath(dealerId));
    },
    [router],
  );

  const exploreCatalog = useCallback(
    (category?: ProductCategory, query?: string) => {
      router.push(catalogPath(category ?? null, query));
    },
    [router],
  );

  /* ---------- Login gate orchestration ---------- */

  const requireLogin = useCallback((action: NonNullable<PendingAction>) => {
    setPendingAction(action);
    setGateFeature(FEATURE_NAMES[action.kind] ?? null);
    setGateOpen(true);
  }, []);

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
          router.push(VIEW_PATHS.profile);
          break;
        case 'saved-view':
          router.push(VIEW_PATHS.saved);
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
    [chat, router, pushToast],
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

  const openLogin = useCallback(() => {
    setGateFeature(null);
    setGateOpen(true);
  }, []);

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
    router.push(VIEW_PATHS.profile);
  }, [isLoggedIn, requireLogin, router]);

  const openSaved = useCallback(() => {
    if (!isLoggedIn) {
      requireLogin({ kind: 'saved-view' });
      return;
    }
    router.push(VIEW_PATHS.saved);
  }, [isLoggedIn, requireLogin, router]);

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

  const smartNavigate = useCallback(
    (next: AppView) => {
      if (next === 'saved') return openSaved();
      if (next === 'profile') return openProfile();
      navigate(next);
    },
    [navigate, openSaved, openProfile],
  );

  /* ---------- Dock expand → auto product-advice on a PDP ---------- */

  const activeProductRef = useRef<Product | null>(null);
  const autoContextRef = useRef<string | null>(null);

  const setActiveProduct = useCallback((product: Product | null) => {
    activeProductRef.current = product;
  }, []);

  const setDockExpanded = useCallback(
    (expanded: boolean) => {
      setDockExpandedState(expanded);
      if (!expanded) return;
      const product = activeProductRef.current;
      if (!product) return;
      if (autoContextRef.current === product.id) return;
      autoContextRef.current = product.id;
      chat.openWithProduct(product);
    },
    [chat],
  );

  const openFullChat = useCallback(() => {
    setDockExpandedState(false);
    router.push(VIEW_PATHS.chat);
  }, [router]);

  /* ---------- Inspeksi / logout ---------- */

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
    router.push(VIEW_PATHS.landing);
    pushToast('Kamu sudah keluar dari akun.');
  }, [logout, router, pushToast]);

  const value: AppContextValue = {
    isLoggedIn,
    user,
    savedIds,
    inspeksiRequests,
    chat,
    dockExpanded,
    setDockExpanded,
    setActiveProduct,
    navigate,
    smartNavigate,
    openProduct,
    openDealer,
    exploreCatalog,
    openFullChat,
    toggleSave,
    requestInspeksi,
    contactSeller,
    openSaved,
    openProfile,
    requireLogin,
    handleLogout,
    gateOpen,
    gateFeature,
    openLogin,
    closeGate,
    handleGateLogin,
    inspeksiFormOpen,
    inspeksiFormProduct,
    closeInspeksiForm: () => setInspeksiFormOpen(false),
    submitInspeksi,
    contactProduct,
    closeContact: () => setContactProduct(null),
    toasts,
    pushToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
