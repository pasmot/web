import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Renders AI answers as markdown — safely.
 *
 * react-markdown does NOT render raw HTML (no rehype-raw here), so any HTML in
 * the model output is escaped, not executed → no XSS. URLs are sanitised by the
 * default urlTransform; links open in a new tab with noopener. Images are
 * dropped to avoid loading arbitrary external resources.
 */
const components: Components = {
  a({ node: _node, ...props }) {
    return <a {...props} target="_blank" rel="noopener noreferrer nofollow" />;
  },
};

export function MarkdownText({ children }: { children: string }) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        disallowedElements={['img']}
        unwrapDisallowed
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
