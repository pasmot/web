'use client';

import { isValidElement, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

type LegalPageProps = {
  title: string;
  /** Short line under the title — what the document is about. */
  intro: string;
  lastUpdated: string;
  /** Body of the document, in markdown. */
  content: string;
};

/** Slug used for heading anchors and the table of contents. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Plain text of a markdown heading node (children are already parsed). */
function headings(markdown: string): { id: string; label: string }[] {
  return markdown
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => {
      const label = line.slice(3).replace(/\*\*/g, '').trim();
      return { id: slugify(label), label };
    });
}

/** Flatten a rendered heading back to plain text so it can be slugified. */
function nodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (isValidElement<{ children?: ReactNode }>(node))
    return nodeText(node.props.children);
  return '';
}

const components: Components = {
  // Anchor every top-level section so the TOC and deep links work.
  h2({ node: _node, children, ...props }) {
    const id = slugify(nodeText(children));
    return (
      <h2 id={id} {...props}>
        {children}
      </h2>
    );
  },
  // Tables get their own scroll container so long rows never break the page.
  table({ node: _node, ...props }) {
    return (
      <div className="legal-table-wrap">
        <table {...props} />
      </div>
    );
  },
  a({ node: _node, ...props }) {
    // Tautan ke halaman sendiri dibuka di tab yang sama; tautan luar di tab baru.
    const internal = props.href?.startsWith('/') ?? false;
    if (internal) return <a {...props} />;
    return <a {...props} target="_blank" rel="noopener noreferrer" />;
  },
};

export function LegalPage({ title, intro, lastUpdated, content }: LegalPageProps) {
  const toc = headings(content);
  // Di mobile daftar isi dilipat supaya tidak menutupi isi dokumen; di desktop
  // CSS memaksanya selalu terbuka sebagai sidebar (state ini diabaikan).
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <div className="legal-page">
      <div className="container">
        <header className="legal-head">
          <h1>{title}</h1>
          <p>{intro}</p>
          <span className="legal-updated">
            Terakhir diperbarui: <strong>{lastUpdated}</strong>
          </span>
        </header>

        <div className="legal-layout">
          <nav className={`legal-toc ${tocOpen ? 'open' : ''}`} aria-label="Daftar isi">
            <button
              type="button"
              className="legal-toc-toggle"
              aria-expanded={tocOpen}
              onClick={() => setTocOpen((v) => !v)}
            >
              Daftar Isi
              <ChevronDown size={18} className="legal-toc-chevron" />
            </button>
            <ol>
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} onClick={() => setTocOpen(false)}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="legal-doc">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              disallowedElements={['img']}
              unwrapDisallowed
              components={components}
            >
              {content}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
}
