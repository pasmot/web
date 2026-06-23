import { API_BASE_URL } from './api';

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

export type ChatReply = { answer: string; questionsRemaining: number };

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

export async function sendChat(message: string): Promise<ChatReply> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': getSessionId(),
      },
      body: JSON.stringify({ message }),
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

    return {
      answer: String(json?.data?.answer ?? ''),
      questionsRemaining: Number(json?.data?.questions_remaining ?? 0),
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
