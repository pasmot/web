import { API_BASE_URL, mapRecommendation, type ChatRecommendation } from './api';
import { authHeaders } from './auth';
import type { Product } from '../types/product';

/**
 * Montir AI chat client.
 *
 * The chat endpoint is session-based: a client-generated X-Session-ID groups a
 * conversation (history kept server-side in Redis, 8-min TTL, 5 questions max).
 * No auth token is required. Answers are NOT streamed — a single JSON response
 * carries the full answer, so callers must show a loading state meanwhile.
 */
const SESSION_KEY = 'chat_session_id';

// The backend times out the upstream AI at ~20s; abort slightly later so a
// genuine 504 surfaces rather than the request hanging forever.
const CLIENT_TIMEOUT_MS = 22_000;

/** Per-tab session id (sessionStorage avoids cross-tab 409 collisions). */
export function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function resetSessionId(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export type ChatReply = {
  answer: string;
  questionsRemaining: number;
  /** Listing cards suggested by the AI, ready for the product-card UI. */
  recommendations: Product[];
  /** Listings the AI is comparing side by side (2–3 items). */
  comparisons: Product[];
  /** Suggested follow-up questions to surface as tappable chips. */
  followUps: string[];
};

/** Extra context sent with a chat message. */
export type ChatContext = {
  /** Public listing id (Product.id) of the product the user is viewing. */
  listingId?: string;
};

export class ChatError extends Error {
  status: number;
  /** True when the session's 5-question quota is exhausted (HTTP 429). */
  limitReached: boolean;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ChatError';
    this.status = status;
    this.limitReached = status === 429;
  }
}

const FRIENDLY: Record<number, string> = {
  409: 'Tunggu jawaban sebelumnya selesai dulu ya.',
  429: 'Kuota pertanyaan untuk sesi ini sudah habis.',
  502: 'Montir AI sedang sibuk. Coba lagi sebentar.',
  504: 'Montir AI lama merespons. Coba lagi sebentar.',
};

export async function sendChat(
  message: string,
  context?: ChatContext,
): Promise<ChatReply> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': getSessionId(),
        // Send the Bearer token when logged in; authHeaders() is empty for
        // guests, so guest chat stays unauthenticated as before.
        ...authHeaders(),
      },
      body: JSON.stringify({
        message,
        // Sent when asking about a specific product so the AI can ground its
        // answer on that listing.
        ...(context?.listingId ? { listing_id: context.listingId } : {}),
      }),
      signal: controller.signal,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const detail = json?.errors?.[0]?.detail as string | undefined;
      throw new ChatError(
        FRIENDLY[res.status] ?? detail ?? 'Terjadi kesalahan pada Montir AI.',
        res.status,
      );
    }

    const data = json?.data ?? {};
    const rawRecs: ChatRecommendation[] = Array.isArray(data.recommendations)
      ? data.recommendations
      : [];
    const rawComparisons: ChatRecommendation[] = Array.isArray(data.comparisons)
      ? data.comparisons
      : [];
    const followUps: string[] = Array.isArray(data.follow_up_questions)
      ? data.follow_up_questions.filter((q: unknown): q is string => typeof q === 'string')
      : [];

    return {
      answer: String(data.answer ?? ''),
      questionsRemaining: Number(data.questions_remaining ?? 0),
      recommendations: rawRecs.map(mapRecommendation),
      comparisons: rawComparisons.map(mapRecommendation),
      followUps,
    };
  } catch (err) {
    if (err instanceof ChatError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ChatError('Montir AI lama merespons. Coba lagi sebentar.', 504);
    }
    throw new ChatError('Gagal terhubung ke Montir AI. Cek koneksi kamu.', 0);
  } finally {
    clearTimeout(timer);
  }
}
