'use client';

import * as React from 'react';
import type { Value } from 'platejs';
import { EditorView } from '@/components/ui/editor';
import { BasicNodesKit } from '@/components/editor/plugins/basic-nodes-kit';
import { usePlateEditor } from 'platejs/react';

interface PlatePreviewProps {
  value: Value;
  className?: string;
}

export function PlatePreview({ value, className }: PlatePreviewProps) {
  const editor = usePlateEditor({
    plugins: BasicNodesKit,
    value,
  });

  return (
    <div className={className}>
      <EditorView 
        editor={editor}
        variant="none"
        className="max-w-none prose prose-gray dark:prose-invert"
      />
    </div>
  );
}
