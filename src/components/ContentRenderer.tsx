'use client';

import * as React from 'react';
import MarkdownPreview from './MarkdownPreview';
import HtmlPreview from './HtmlPreview';
import { PlatePreview } from './PlatePreview';
import type { Value } from 'platejs';

interface ContentRendererProps {
  content: string;
  className?: string;
}

export function ContentRenderer({ content, className }: ContentRendererProps) {
  const isPlateContent = React.useMemo(() => {
    if (!content) return false;
    
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) && parsed.length > 0 && 
             parsed[0] && typeof parsed[0] === 'object' && 
             ('type' in parsed[0] || 'children' in parsed[0]);
    } catch {
      return false;
    }
  }, [content]);

  const isHtmlContent = React.useMemo(() => {
    if (!content) return false;
    
    // Check if content is pure HTML document (starts with DOCTYPE or html tag)
    const isPureHtml = content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html');
    
    // For our use case, most content should be treated as markdown (even with HTML tags)
    // Only treat as HTML if it's a complete HTML document
    return isPureHtml;
  }, [content]);

  if (!content) {
    return <div className={className}>No content available</div>;
  }

  if (isPlateContent) {
    try {
      const plateValue: Value = JSON.parse(content);
      return <PlatePreview value={plateValue} className={className} />;
    } catch (error) {
      console.error('Failed to parse Plate content:', error);
      // Fallback to markdown
      return <MarkdownPreview content={content} className={className} />;
    }
  }

  if (isHtmlContent) {
    return <HtmlPreview content={content} className={className} />;
  }

  // It's markdown content
  return <MarkdownPreview content={content} className={className} />;
}

export default ContentRenderer;