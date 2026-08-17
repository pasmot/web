'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import type { ChatMessage } from '../../types/chat';
import type { Product } from '../../types/product';
import { montirIntro, montirStarters } from '../../data/chatMocks';
import { ProductImage } from '../ui/ProductImage';

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
  /** When set, the empty state offers starter questions that send on click. */
  onStarterSelect?: (question: string) => void;
};

export function ChatThread({
  messages,
  isTyping,
  onOpenProduct,
  showWelcome = true,
  onStarterSelect,
}: ChatThreadProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const showStarters = Boolean(onStarterSelect) && messages.length === 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isTyping]);

  return (
    <>
      {showWelcome && messages.length === 0 && (
        <div className="chat-welcome">
          <img src="/brand/montir-ai-logo.png" alt="Montir AI" />
          <h3>{showStarters ? montirStarters.headline : montirIntro.name}</h3>
          <p>{showStarters ? montirStarters.subhead : montirIntro.welcome}</p>
        </div>
      )}

      {showStarters && (
        <div className="chat-starters">
          <span className="chat-starters-label">{montirStarters.label}</span>
          <div className="chat-starters-grid">
            {montirStarters.questions.map((item) => (
              <button
                key={item.text}
                type="button"
                className="chat-starter"
                onClick={() => onStarterSelect?.(item.text)}
              >
                <strong>{item.text}</strong>
                <small>{item.category}</small>
              </button>
            ))}
          </div>
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
          {msg.comparisons && msg.comparisons.length > 0 && (
            <div className="chat-compare">
              {msg.comparisons.map((product) => (
                <button
                  key={product.id}
                  className="chat-compare-card"
                  onClick={() => onOpenProduct(product)}
                >
                  <ProductImage
                    src={product.image}
                    alt={product.title}
                    className="chat-compare-media"
                    compact
                  />
                  <span className="chat-compare-info">
                    <strong>{product.title}</strong>
                    <span className="price">{product.price}</span>
                    <small>{product.tag}</small>
                    {product.location && (
                      <small className="muted">{product.location}</small>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
          {msg.products && msg.products.length > 0 && (
            <div className="chat-products">
              {msg.products.map((product) => {
                const meta = [product.location, product.year, product.mileage]
                  .filter(Boolean)
                  .join(' · ');
                return (
                  <button
                    key={product.id}
                    className="chat-product-card"
                    onClick={() => onOpenProduct(product)}
                  >
                    <ProductImage src={product.image} alt={product.title} compact />
                    <span className="chat-product-card-info">
                      <strong>{product.title}</strong>
                      <span className="price">{product.price}</span>
                      {meta && <small>{meta}</small>}
                    </span>
                    <ChevronRight size={17} />
                  </button>
                );
              })}
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
