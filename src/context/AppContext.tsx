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
import type { AppView, PendingAction } from '../types/app';
import type { Product } from '../types/product';
import {
  createInspection,
  fetchMyBookmarks,
  fetchMyInspections,
  toggleBookmark,
  type CreateInspectionPayload,
  type Inspection,
} from '../lib/api';
import { useAuth, type AuthUser } from '../hooks/useAuth';
import { useMontirChat, type MontirChat } from '../hooks/useMontirChat';
import { useRouter } from 'next/navigation';
import { VIEW_PATHS, productPath, dealerPath, catalogPath } from '../lib/routes';

const FEATURE_NAMES: Record<string, string> = {
  wishlist: 'Incaran / Wishlist',
  'saved-view': 'Incaran / Wishlist',
  profile: 'Profil & Akun',
  inspeksi: 'Jasa Inspeksi',
  'inspeksi-view': 'Jasa Inspeksi',
  'chat-continue': 'Chat Montir AI Lanjutan',
};

export type ToastVariant = 'success' | 'error';
export type Toast = { id: number; text: string; variant: ToastVariant };

let toastCounter = 0;

type AppContextValue = {
  isLoggedIn: boolean;
  /** False until the stored token has been restored — gates must wait for it. */
  authReady: boolean;
  user: AuthUser;
  /** Wishlist product ids (Product.id / UUID), derived from savedProducts. */
  savedIds: string[];
  /** Server-backed wishlist (GET /api/v1/me/bookmarks), newest first. */
  savedProducts: Product[];
  /** True while the wishlist is being (re)loaded from the server. */
  savedLoading: boolean;
  /** Server-backed inspection requests (GET /api/v1/me/inspections), newest first. */
  inspeksiRequests: Inspection[];
  /** True while inspection requests are being (re)loaded from the server. */
  inspeksiLoading: boolean;
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
  /** Navigate to a listing detail by its public id (UUID). */
  openListing: (publicId: string) => void;
  openDealer: (dealerId: string) => void;
  /** Navigate to the catalog, optionally pre-filtered by API category slug. */
  exploreCatalog: (categorySlug?: string, query?: string) => void;
  /** Go back to the catalog, preserving its scroll/filters via history. */
  backToCatalog: () => void;
  openFullChat: () => void;

  // tier-2 (gated) actions
  toggleSave: (product: Product) => void;
  requestInspeksi: (product: Product | null) => void;
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
  /** Manual token fallback (paste a JWT) — returns false if invalid. */
  handleGateToken: (token: string) => boolean;

  // inspeksi form modal
  inspeksiFormOpen: boolean;
  inspeksiFormProduct: Product | null;
  closeInspeksiForm: () => void;
  /**
   * Registers an inspection for the current inspeksiFormProduct. Scheduling and
   * location are coordinated via WhatsApp afterwards, so no form data is needed.
   * Resolves with the authoritative fee; rejects with a user-facing message.
   */
  submitInspeksi: () => Promise<{ feeAmount: number }>;

  // toasts
  toasts: Toast[];
  pushToast: (text: string, variant?: ToastVariant) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <AppProvider>');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isLoggedIn, ready: authReady, user, login, loginWithToken, logout } =
    useAuth();

  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [inspeksiRequests, setInspeksiRequests] = useState<Inspection[]>([]);
  const [inspeksiLoading, setInspeksiLoading] = useState(false);

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateFeature, setGateFeature] = useState<string | null>(null);

  const [inspeksiFormOpen, setInspeksiFormOpen] = useState(false);
  const [inspeksiFormProduct, setInspeksiFormProduct] = useState<Product | null>(null);

  const [dockExpanded, setDockExpandedState] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback(
    (text: string, variant: ToastVariant = 'success') => {
      const id = ++toastCounter;
      setToasts((prev) => [...prev, { id, text, variant }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2600);
    },
    [],
  );

  /* ---------- Bookmarks (server-backed wishlist) ---------- */

  // Mirror for callbacks that need the current list without re-binding.
  const savedRef = useRef<Product[]>([]);
  savedRef.current = savedProducts;

  const refreshBookmarks = useCallback(async (): Promise<Product[]> => {
    setSavedLoading(true);
    try {
      const items = await fetchMyBookmarks();
      setSavedProducts(items);
      return items;
    } finally {
      setSavedLoading(false);
    }
  }, []);

  // Load the wishlist when a session starts; drop it on logout.
  useEffect(() => {
    if (!isLoggedIn) {
      setSavedProducts([]);
      return;
    }
    refreshBookmarks().catch(() => {});
  }, [isLoggedIn, refreshBookmarks]);

  /* ---------- Inspections (server-backed) ---------- */

  const refreshInspections = useCallback(async (): Promise<Inspection[]> => {
    setInspeksiLoading(true);
    try {
      const items = await fetchMyInspections();
      setInspeksiRequests(items);
      return items;
    } finally {
      setInspeksiLoading(false);
    }
  }, []);

  // Load inspection requests when a session starts; drop them on logout.
  useEffect(() => {
    if (!isLoggedIn) {
      setInspeksiRequests([]);
      return;
    }
    refreshInspections().catch(() => {});
  }, [isLoggedIn, refreshInspections]);

  // Optimistic toggle synced to POST /listings/{id}/bookmark. Static prototype
  // products carry no internalId and only toggle locally.
  const performToggleSave = useCallback(
    (product: Product) => {
      const wasSaved = savedRef.current.some((p) => p.id === product.id);
      setSavedProducts((prev) =>
        wasSaved
          ? prev.filter((p) => p.id !== product.id)
          : [product, ...prev],
      );
      pushToast(wasSaved ? 'Dihapus dari Incaran' : 'Tersimpan ke Incaran');

      if (product.internalId == null) return;

      toggleBookmark(product.internalId)
        .then((result) => {
          // The server is the source of truth — reconcile if a race flipped it.
          setSavedProducts((prev) => {
            const has = prev.some((p) => p.id === product.id);
            if (result.bookmarked && !has) return [product, ...prev];
            if (!result.bookmarked && has) {
              return prev.filter((p) => p.id !== product.id);
            }
            return prev;
          });
        })
        .catch(() => {
          // Roll back the optimistic flip.
          setSavedProducts((prev) =>
            wasSaved
              ? [product, ...prev]
              : prev.filter((p) => p.id !== product.id),
          );
          pushToast('Gagal menyimpan ke Incaran — coba lagi.');
        });
    },
    [pushToast],
  );

  /* ---------- Chat (shared between dock & full view) ---------- */

  const onChatGateHit = useCallback((pendingMessage: string) => {
    setPendingAction({ kind: 'chat-continue', message: pendingMessage });
    setGateFeature(FEATURE_NAMES['chat-continue']);
    setGateOpen(true);
  }, []);

  const chat = useMontirChat({ isLoggedIn, onGateHit: onChatGateHit });

  /* ---------- Navigation ---------- */

  // Tracks whether we've navigated within the app, so "back" can safely use
  // browser history (and fall back to a push on a cold deep-link).
  const hasInternalHistory = useRef(false);

  const navigate = useCallback(
    (next: AppView) => {
      hasInternalHistory.current = true;
      router.push(VIEW_PATHS[next as keyof typeof VIEW_PATHS] ?? '/');
    },
    [router],
  );

  const openProduct = useCallback(
    (product: Product) => {
      hasInternalHistory.current = true;
      setDockExpandedState(false);
      router.push(productPath(product.id));
    },
    [router],
  );

  const openListing = useCallback(
    (publicId: string) => {
      hasInternalHistory.current = true;
      setDockExpandedState(false);
      router.push(productPath(publicId));
    },
    [router],
  );

  const openDealer = useCallback(
    (dealerId: string) => {
      hasInternalHistory.current = true;
      router.push(dealerPath(dealerId));
    },
    [router],
  );

  const exploreCatalog = useCallback(
    (categorySlug?: string, query?: string) => {
      hasInternalHistory.current = true;
      router.push(catalogPath(categorySlug ?? null, query));
    },
    [router],
  );

  const backToCatalog = useCallback(() => {
    setDockExpandedState(false);
    if (hasInternalHistory.current) {
      router.back();
    } else {
      router.push(VIEW_PATHS.catalog);
    }
  }, [router]);

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
          const { product } = action;
          // Sync with the server first — the listing may already be bookmarked
          // from a previous session, and a blind toggle would remove it.
          refreshBookmarks()
            .then((items) => {
              if (items.some((p) => p.id === product.id)) {
                pushToast('Sudah ada di Incaran');
              } else {
                performToggleSave(product);
              }
            })
            .catch(() => performToggleSave(product));
          break;
        }
        case 'profile':
          router.push(VIEW_PATHS.profile);
          break;
        case 'saved-view':
          router.push(VIEW_PATHS.saved);
          break;
        case 'inspeksi-view':
          router.push(VIEW_PATHS.inspeksi);
          break;
        case 'inspeksi': {
          setInspeksiFormProduct(action.product);
          setInspeksiFormOpen(true);
          break;
        }
        case 'chat-continue':
          chat.sendMessage(action.message);
          break;
      }
    },
    [chat, router, pushToast, refreshBookmarks, performToggleSave],
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

  // Google OAuth — full-page redirect; the app captures ?token= on return.
  const handleGateLogin = useCallback(() => {
    login();
  }, [login]);

  // Manual token fallback: log in immediately so the pending action resumes.
  const handleGateToken = useCallback(
    (token: string): boolean => {
      const ok = loginWithToken(token);
      if (ok) {
        setGateOpen(false);
        setGateFeature(null);
        pushToast('Berhasil masuk — selamat datang!');
      }
      return ok;
    },
    [loginWithToken, pushToast],
  );

  const closeGate = useCallback(() => {
    setGateOpen(false);
    setGateFeature(null);
    setPendingAction(null);
  }, []);

  /* ---------- Tier-2 triggers ---------- */

  const toggleSave = useCallback(
    (product: Product) => {
      if (!isLoggedIn) {
        requireLogin({ kind: 'wishlist', product });
        return;
      }
      performToggleSave(product);
    },
    [isLoggedIn, requireLogin, performToggleSave],
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
        requireLogin({ kind: 'inspeksi', product });
        return;
      }
      setInspeksiFormProduct(product);
      setInspeksiFormOpen(true);
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
    async (): Promise<{ feeAmount: number }> => {
      const product = inspeksiFormProduct;
      if (product?.internalId == null) {
        throw new Error('Unit ini tidak bisa diinspeksi. Buka listing dari Pasar.');
      }
      // Jadwal & lokasi dikonfirmasi lewat WhatsApp, jadi kirim default aman.
      const payload: CreateInspectionPayload = {
        scheduled_date: new Date().toISOString().slice(0, 10),
        meeting_location: 'Dijadwalkan via WhatsApp',
      };
      const created = await createInspection(product.internalId, payload);
      // Refresh so the list reflects the new request (fire-and-forget).
      refreshInspections().catch(() => {});
      return { feeAmount: created.feeAmount };
    },
    [inspeksiFormProduct, refreshInspections],
  );

  const handleLogout = useCallback(() => {
    logout();
    router.push(VIEW_PATHS.landing);
    pushToast('Kamu sudah keluar dari akun.');
  }, [logout, router, pushToast]);

  const value: AppContextValue = {
    isLoggedIn,
    authReady,
    user,
    savedIds: savedProducts.map((p) => p.id),
    savedProducts,
    savedLoading,
    inspeksiRequests,
    inspeksiLoading,
    chat,
    dockExpanded,
    setDockExpanded,
    setActiveProduct,
    navigate,
    smartNavigate,
    openProduct,
    openListing,
    openDealer,
    exploreCatalog,
    backToCatalog,
    openFullChat,
    toggleSave,
    requestInspeksi,
    openSaved,
    openProfile,
    requireLogin,
    handleLogout,
    gateOpen,
    gateFeature,
    openLogin,
    closeGate,
    handleGateLogin,
    handleGateToken,
    inspeksiFormOpen,
    inspeksiFormProduct,
    closeInspeksiForm: () => setInspeksiFormOpen(false),
    submitInspeksi,
    toasts,
    pushToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
