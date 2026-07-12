import { useRef, useState } from 'react';
import { AlertCircle, ArrowUp, RotateCcw, Sparkles, X } from 'lucide-react';
import type { MontirChat } from '../hooks/useMontirChat';
import type { Product } from '../types/product';
import {
  followUpSuggestions,
  generalSuggestions,
  montirIntro,
  productAdviceSuggestions,
} from '../data/chatMocks';
import { ChatThread } from '../components/chat/ChatThread';

type ChatPageProps = {
  chat: MontirChat;
  isLoggedIn: boolean;
  onOpenProduct: (product: Product) => void;
};

export function ChatPage({ chat, isLoggedIn, onOpenProduct }: ChatPageProps) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const send = (text: string) => {
    const value = text.trim();
    if (!value) return;
    if (chat.sendMessage(value)) setDraft('');
    inputRef.current?.focus();
  };

  // Prefer the AI's own follow-up questions; fall back to static suggestions.
  const chips =
    chat.followUps.length > 0
      ? chat.followUps
      : chat.messages.length === 0
        ? chat.mode === 'product-advice'
          ? productAdviceSuggestions
          : generalSuggestions
        : chat.mode === 'product-advice'
          ? productAdviceSuggestions
          : followUpSuggestions;

  const showQuota = !isLoggedIn && chat.remainingFree <= 2;

  return (
    <div className="chat-page">
      <div className="chat-page-head">
        <div className="chat-page-head-inner">
          <img src="/brand/montir-ai-logo.png" alt="" />
          <div>
            <strong>{montirIntro.name}</strong>
            <small>{montirIntro.tagline}</small>
          </div>
        </div>
      </div>

      <div className="chat-page-thread">
        <div className="chat-page-thread-inner">
          {chat.contextProduct && (
            <div className="montir-context-pill" style={{ margin: 0 }}>
              <img src={chat.contextProduct.image} alt="" />
              <span>
                Membahas: <strong>{chat.contextProduct.title}</strong>
              </span>
              <button
                onClick={chat.clearContext}
                aria-label="Hapus konteks produk"
                title="Hapus konteks produk"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <ChatThread
            messages={chat.messages}
            isTyping={chat.isTyping}
            onOpenProduct={onOpenProduct}
          />
          {chat.error && (
            <div className="chat-error">
              <AlertCircle size={13} />
              {chat.error}
            </div>
          )}
          {showQuota && !chat.limitReached && (
            <div className="chat-quota">
              <Sparkles size={13} />
              {chat.remainingFree > 0
                ? `Sisa ${chat.remainingFree} pesan gratis — login untuk lanjut`
                : 'Kuota gratis habis — login untuk lanjut chat'}
            </div>
          )}
        </div>
      </div>

      <div className="chat-page-composer">
        <div className="chat-page-composer-inner">
          {chat.limitReached ? (
            <div className="chat-reset">
              <p>Kuota pertanyaan sesi ini sudah habis.</p>
              <button className="chat-reset-btn" onClick={chat.resetSession}>
                <RotateCcw size={15} />
                Mulai percakapan baru
              </button>
            </div>
          ) : (
            <>
              {!chat.isTyping && (
                <div className="chat-chips">
                  {chips.map((chip) => (
                    <button key={chip} className="chat-chip" onClick={() => send(chip)}>
                      {chip}
                    </button>
                  ))}
                </div>
              )}
              <form
                className="chat-page-composer-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  send(draft);
                }}
              >
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  disabled={chat.isTyping}
                  placeholder={montirIntro.composerPlaceholder}
                  aria-label={montirIntro.composerPlaceholder}
                />
                <button
                  type="submit"
                  className={`montir-send ${draft.trim() ? 'ready' : ''}`}
                  disabled={!draft.trim() || chat.isTyping}
                  aria-label="Kirim"
                >
                  <ArrowUp size={19} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
