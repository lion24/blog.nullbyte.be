'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CodeBlockElementProps {
  className?: string;
  children: React.ReactNode;
  language?: string;
  style?: React.CSSProperties;
  [key: string]: unknown; // Allow additional props from Plate.js
}

export const CodeBlockElement = React.forwardRef<
  HTMLPreElement,
  CodeBlockElementProps
>(({ className, children, language, style, ...allProps }, ref) => {
  // Filter out Plate.js specific props that shouldn't be passed to DOM
  const plateProps = ['element', 'editor', 'attributes', 'nodeProps', 'setOption', 'setOptions', 'getOption', 'getOptions'];
  const domProps = Object.fromEntries(
    Object.entries(allProps).filter(([key]) => !plateProps.includes(key))
  );
  return (
    <pre
      ref={ref}
      className={cn(
        'relative overflow-x-auto rounded-md border p-4 font-mono text-sm',
        'bg-muted text-foreground',
        className as string
      )}
      style={{
        backgroundColor: 'var(--background-tertiary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border)',
        ...(style as React.CSSProperties),
      }}
      {...domProps}
    >
      {(language as string) && (
        <div
          className="absolute right-2 top-2 rounded px-2 py-1 text-xs"
          style={{
            backgroundColor: 'var(--background-secondary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          {language as string}
        </div>
      )}
      <code className="block">{children as React.ReactNode}</code>
    </pre>
  );
});

CodeBlockElement.displayName = 'CodeBlockElement';