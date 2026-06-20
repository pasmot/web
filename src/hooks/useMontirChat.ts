import { useCallback, useRef, useState } from 'react';
import type { ChatMessage, ChatMode } from '../types/chat';
import type { Product } from '../types/product';
import {
  CHAT_FREE_LIMIT,
  getMockReply,
  getProductAdviceOpener,
} from '../data/chatMocks';

let userMsgCounter = 0;

export type MontirChat = ReturnType<typeof useMontirChat>;

type UseMontirChatArgs = {
  isLoggedIn: boolean;
  /** Called when the free-message quota is hit; receives the blocked message */
  onGateHit: (pendingMessage: string) => void;
};

/**
 * Single chat session shared by the floating dock and the full chat view.
 * Quota counts USER messages only, per session (resets on reload).
 */
export function useMontirChat({ isLoggedIn, onGateHit }: UseMontirChatArgs) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mode, setMode] = useState<ChatMode>('recommendation');
  const [contextProduct, setContextProduct] = useState<Product | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const typingTimer = useRef<number | null>(null);

  const remainingFree = Math.max(0, CHAT_FREE_LIMIT - userMessageCount);

  const queueReply = useCallback(
    (text: string, replyMode: ChatMode, product: Product | null) => {
      setIsTyping(true);
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
      typingTimer.current = window.setTimeout(() => {
        setMessages((prev) => [...prev, ...getMockReply(text, replyMode, product)]);
        setIsTyping(false);
      }, 1600);
    },
    [],
  );

  /**
   * Send a user message. Returns false when blocked by the login gate
   * (the message is handed to onGateHit as the pending action).
   */
  const sendMessage = useCallback(
    (rawText: string): boolean => {
      const text = rawText.trim();
      if (!text || isTyping) return false;

      if (!isLoggedIn && userMessageCount >= CHAT_FREE_LIMIT) {
        onGateHit(text);
        return false;
      }

      setMessages((prev) => [
        ...prev,
        { id: `user-${++userMsgCounter}`, role: 'user', text },
      ]);
      setUserMessageCount((c) => c + 1);
      queueReply(text, mode, contextProduct);
      return true;
    },
    [isLoggedIn, isTyping, userMessageCount, mode, contextProduct, onGateHit, queueReply],
  );

  /**
   * Open chat in product-advice mode. Injects a context opener exchange
   * (not counted against the free quota — it is system-generated).
   */
  const openWithProduct = useCallback(
    (product: Product) => {
      setMode('product-advice');
      if (contextProduct?.id === product.id) return;
      setContextProduct(product);
      setMessages((msgs) => [
        ...msgs,
        {
          id: `user-${++userMsgCounter}`,
          role: 'user',
          text: `Aku lagi lihat ${product.title} (${product.year} · ${product.mileage}). Apa saja yang perlu aku cek?`,
        },
      ]);
      setIsTyping(true);
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
      typingTimer.current = window.setTimeout(() => {
        setMessages((msgs) => [...msgs, ...getProductAdviceOpener(product)]);
        setIsTyping(false);
      }, 1600);
    },
    [contextProduct],
  );

  const clearContext = useCallback(() => {
    setContextProduct(null);
    setMode('recommendation');
  }, []);

  return {
    messages,
    mode,
    contextProduct,
    isTyping,
    userMessageCount,
    remainingFree,
    sendMessage,
    openWithProduct,
    clearContext,
  };
}
