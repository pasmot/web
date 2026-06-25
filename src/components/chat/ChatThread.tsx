'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import type { ChatMessage } from '../../types/chat';
import type { Product } from '../../types/product';
import { montirIntro } from '../../data/chatMocks';

// Lazily loaded so react-markdown is fetched only when an AI answer renders —
// keeps it out of the app-wide bundle (MontirDock ships in every page's shell).
const MarkdownText = dynamic(
  () => import('./MarkdownText').then((m) => m.MarkdownText),
  { ssr: false },
);

type ChatThreadProps = {
  messages: ChatMessage[];
  isTyping: boolean;
  onOpenProduct: (product: Product) => void;
  showWelcome?: boolean;
};

export function ChatThread({
  messages,
  isTyping,
  onOpenProduct,
  showWelcome = true,
}: ChatThreadProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isTyping]);

  return (
    <>
      {showWelcome && messages.length === 0 && (
        <div className="chat-welcome">
          <img src="/brand/montir-ai-logo.png" alt="Montir AI" />
          <h3>{montirIntro.name}</h3>
          <p>{montirIntro.welcome}</p>
        </div>
      )}

      {messages.map((msg) => (
        <div key={msg.id} className={`chat-msg ${msg.role}`}>
          {msg.badge && (
            <span className="chat-badge">
              <Sparkles size={11} />
              {msg.badge}
            </span>
          )}
          <div
            className={`chat-bubble ${msg.role === 'assistant' ? 'md-bubble' : ''}`}
          >
            {msg.role === 'assistant' ? (
              <MarkdownText>{msg.text}</MarkdownText>
            ) : (
              msg.text
            )}
          </div>
          {msg.checklist && (
            <ul className="chat-checklist">
              {msg.checklist.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={15} />
                  {item}
                </li>
              ))}
            </ul>
          )}
          {msg.products && msg.products.length > 0 && (
            <div className="chat-products">
              {msg.products.map((product) => (
                <button
                  key={product.id}
                  className="chat-product-card"
                  onClick={() => onOpenProduct(product)}
                >
                  <img src={product.image} alt={product.title} />
                  <span className="chat-product-card-info">
                    <strong>{product.title}</strong>
                    <span className="price">{product.price}</span>
                    <small>
                      {product.location} · {product.year} · {product.mileage}
                    </small>
                  </span>
                  <ChevronRight size={17} />
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {isTyping && (
        <div className="chat-typing">
          <span className="chat-typing-dots">
            <i />
            <i />
            <i />
          </span>
          {montirIntro.thinking}
        </div>
      )}

      <div ref={endRef} />
    </>
  );
}
