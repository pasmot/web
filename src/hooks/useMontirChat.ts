import { useCallback, useRef, useState } from 'react';
import type { ChatMessage, ChatMode } from '../types/chat';
import type { Product } from '../types/product';
import { CHAT_FREE_LIMIT } from '../data/chatMocks';
import { ChatError, resetSessionId, sendChat } from '../lib/chat';

let msgCounter = 0;
const nextId = (role: string) => `${role}-${++msgCounter}`;

export type MontirChat = ReturnType<typeof useMontirChat>;

type UseMontirChatArgs = {
  isLoggedIn: boolean;
  /** Called when the free-message quota is hit; receives the blocked message */
  onGateHit: (pendingMessage: string) => void;
};

/**
 * Single chat session (dock + full view) backed by the live Montir AI API.
 * Guests get a few free messages before the login gate; the API enforces a
 * hard 5-questions-per-session cap (questions_remaining → limitReached).
 */
export function useMontirChat({ isLoggedIn, onGateHit }: UseMontirChatArgs) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mode, setMode] = useState<ChatMode>('recommendation');
  const [contextProduct, setContextProduct] = useState<Product | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  // Follow-up chips from the latest reply; cleared while a new send is pending.
  const [followUps, setFollowUps] = useState<string[]>([]);

  // Product id whose context has already been sent (the API remembers history,
  // so context is only prepended to the first message of a product chat).
  const contextSentRef = useRef<string | null>(null);

  const remainingFree = Math.max(0, CHAT_FREE_LIMIT - userMessageCount);

  const sendMessage = useCallback(
    (rawText: string): boolean => {
      const text = rawText.trim();
      if (!text || isTyping || limitReached) return false;

      // Guest login gate (encourages sign-in before the free quota runs out).
      if (!isLoggedIn && userMessageCount >= CHAT_FREE_LIMIT) {
        onGateHit(text);
        return false;
      }

      setMessages((prev) => [...prev, { id: nextId('user'), role: 'user', text }]);
      setError(null);
      setFollowUps([]);
      setIsTyping(true);

      // Fold product context into the first message of a product-advice chat.
      let apiMessage = text;
      const ctx = contextProduct;
      if (mode === 'product-advice' && ctx && contextSentRef.current !== ctx.id) {
        const parts = [
          `Saya sedang melihat listing "${ctx.title}"`,
          ctx.year ? `tahun ${ctx.year}` : '',
          `harga ${ctx.price}`,
          `lokasi ${ctx.location}`,
        ].filter(Boolean);
        apiMessage = `${parts.join(', ')}. ${text}`;
      }

      // Ground the answer on the viewed product when in product-advice mode.
      const listingId = mode === 'product-advice' && ctx ? ctx.id : undefined;

      sendChat(apiMessage, { listingId })
        .then(({ answer, questionsRemaining, recommendations, comparisons, followUps: replyFollowUps }) => {
          if (mode === 'product-advice' && ctx) contextSentRef.current = ctx.id;
          setMessages((prev) => [
            ...prev,
            {
              id: nextId('assistant'),
              role: 'assistant',
              text: answer,
              products: recommendations.length ? recommendations : undefined,
              comparisons: comparisons.length ? comparisons : undefined,
              followUps: replyFollowUps.length ? replyFollowUps : undefined,
            },
          ]);
          setFollowUps(replyFollowUps);
          setUserMessageCount((c) => c + 1);
          setRemaining(questionsRemaining);
          if (questionsRemaining <= 0) setLimitReached(true);
        })
        .catch((err: unknown) => {
          const message =
            err instanceof Error ? err.message : 'Terjadi kesalahan pada Montir AI.';
          setError(message);
          if (err instanceof ChatError && err.limitReached) setLimitReached(true);
        })
        .finally(() => setIsTyping(false));

      return true;
    },
    [isLoggedIn, isTyping, limitReached, userMessageCount, mode, contextProduct, onGateHit],
  );

  /** Enter product-advice mode. No API call — context rides the next message. */
  const openWithProduct = useCallback(
    (product: Product) => {
      setMode('product-advice');
      setContextProduct((cur) => {
        if (cur?.id !== product.id) contextSentRef.current = null;
        return product;
      });
    },
    [],
  );

  const clearContext = useCallback(() => {
    setContextProduct(null);
    setMode('recommendation');
    contextSentRef.current = null;
  }, []);

  /** Start a fresh conversation (new session id, blank slate). */
  const resetSession = useCallback(() => {
    resetSessionId();
    setMessages([]);
    setError(null);
    setLimitReached(false);
    setRemaining(null);
    setFollowUps([]);
    setUserMessageCount(0);
    setMode('recommendation');
    setContextProduct(null);
    contextSentRef.current = null;
  }, []);

  return {
    messages,
    mode,
    contextProduct,
    isTyping,
    userMessageCount,
    remainingFree,
    /** Questions left in the API session (null until the first reply). */
    remaining,
    limitReached,
    /** Suggested follow-up questions from the latest reply (empty if none). */
    followUps,
    error,
    sendMessage,
    openWithProduct,
    clearContext,
    resetSession,
  };
}
