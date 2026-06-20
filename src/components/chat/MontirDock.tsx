import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Maximize2, Minus, Sparkles, X } from 'lucide-react';
import { ChatThread } from './ChatThread';
import type { MontirChat } from '../../hooks/useMontirChat';
import type { Product } from '../../types/product';
import {
  generalSuggestions,
  followUpSuggestions,
  montirIntro,
  productAdviceSuggestions,
} from '../../data/chatMocks';

export type DockMode = 'bar' | 'mini';

type MontirDockProps = {
  chat: MontirChat;
  isLoggedIn: boolean;
  expanded: boolean;
  /** Collapsed appearance: full bar (home hero) or small floating button */
  mode: DockMode;
  onExpandChange: (expanded: boolean) => void;
  onOpenProduct: (product: Product) => void;
  onOpenFullChat: () => void;
};

export function MontirDock({
  chat,
  isLoggedIn,
  expanded,
  mode,
  onExpandChange,
  onOpenProduct,
  onOpenFullChat,
}: MontirDockProps) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);

  const send = (text: string) => {
    const value = text.trim();
    if (!value) return;
    if (!expanded) onExpandChange(true);
    if (chat.sendMessage(value)) setDraft('');
  };

  const suggestions =
    chat.mode === 'product-advice' ? productAdviceSuggestions : generalSuggestions;
  const chips =
    chat.messages.length === 0
      ? suggestions
      : chat.mode === 'product-advice'
        ? productAdviceSuggestions
        : followUpSuggestions;

  const showQuota = !isLoggedIn && chat.remainingFree <= 2;
  const isMini = !expanded && mode === 'mini';

  return (
    <div className={`montir-dock ${expanded ? 'expanded' : mode}`}>
      {/* Mini floating button layer (crossfades in when morphed small) */}
      <button
        className="montir-mini"
        onClick={() => onExpandChange(true)}
        aria-label="Buka Montir AI"
        title="Tanya Montir AI"
        tabIndex={isMini ? 0 : -1}
        aria-hidden={!isMini}
      >
        <img src="/brand/montir-ai-logo.png" alt="" />
      </button>

      {/* Full content layer (bar + expanded panel) */}
      <div className="montir-dock-full" aria-hidden={isMini}>
        <div
          className={`montir-dock-head ${expanded ? '' : 'clickable'}`}
          onClick={expanded ? undefined : () => onExpandChange(true)}
          role={expanded ? undefined : 'button'}
        >
          <img className="montir-logo" src="/brand/montir-ai-logo.png" alt="" />
          <div>
            <strong>{montirIntro.name}</strong>
            {expanded && <small>{montirIntro.tagline}</small>}
          </div>
          <div className="montir-dock-head-actions">
            {expanded && (
              <>
                <button
                  className="icon-btn"
                  onClick={onOpenFullChat}
                  aria-label="Buka chat penuh"
                  title="Buka chat penuh"
                >
                  <Maximize2 size={16} />
                </button>
                <button
                  className="icon-btn"
                  onClick={() => onExpandChange(false)}
                  aria-label="Kecilkan"
                  title="Kecilkan"
                >
                  <Minus size={17} />
                </button>
              </>
            )}
          </div>
        </div>

        {expanded && chat.contextProduct && (
          <div className="montir-context-pill">
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

        {expanded && (
          <>
            <div className="montir-thread">
              <ChatThread
                messages={chat.messages}
                isTyping={chat.isTyping}
                onOpenProduct={onOpenProduct}
              />
              {showQuota && (
                <div className="chat-quota">
                  <Sparkles size={13} />
                  {chat.remainingFree > 0
                    ? `Sisa ${chat.remainingFree} pesan gratis — login untuk lanjut tanpa batas`
                    : 'Kuota gratis habis — login untuk lanjut chat'}
                </div>
              )}
            </div>

            {!chat.isTyping && (
              <div className="chat-chips">
                {chips.map((chip) => (
                  <button key={chip} className="chat-chip" onClick={() => send(chip)}>
                    {chip}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <form
          className="montir-composer"
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
        >
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={() => {
              if (!expanded) onExpandChange(true);
            }}
            placeholder={montirIntro.dockPlaceholder}
            aria-label={montirIntro.dockPlaceholder}
            tabIndex={isMini ? -1 : 0}
          />
          <button
            type="submit"
            className={`montir-send ${draft.trim() ? 'ready' : ''}`}
            disabled={!draft.trim()}
            aria-label="Kirim"
            tabIndex={isMini ? -1 : 0}
          >
            <ArrowUp size={19} />
          </button>
        </form>
      </div>
    </div>
  );
}
