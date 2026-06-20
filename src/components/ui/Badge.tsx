import type { ReactNode } from 'react';

type BadgeProps = {
  tone?: 'neutral' | 'red' | 'dark' | 'success' | 'warning' | 'info';
  children: ReactNode;
  className?: string;
};

export function Badge({ tone = 'neutral', children, className = '' }: BadgeProps) {
  const toneClass = tone === 'neutral' ? '' : `badge-${tone}`;
  return <span className={`badge ${toneClass} ${className}`.trim()}>{children}</span>;
}
