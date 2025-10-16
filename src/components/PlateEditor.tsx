'use client';

import * as React from 'react';
import type { Value, SlateEditor as PlateEditorType } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';
import { MarkdownPlugin } from '@platejs/markdown';

import { EditorKit } from '@/components/editor/editor-kit';
import { Editor, EditorContainer } from '@/components/ui/editor';

interface PlateEditorProps {
  initialValue?: string; // For setting initial markdown content (edit mode)
  onChange?: (value: Value) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

const defaultValue: Value = [
  {
    type: 'p',
    children: [{ text: '' }],
  },
];

export function PlateEditor({ 
  initialValue, 
  onChange, 
  placeholder = "Start writing your amazing content...",
  className,
  style
}: PlateEditorProps) {
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: defaultValue,
  });

  // Handle initial markdown conversion only once
  React.useEffect(() => {
    if (!initialValue) return;

    // Sanitize incoming markdown to strip inline color/background styles, then deserialize it once
    const sanitized = stripInlineColorStyles(initialValue);
    const deserializedValue = editor.getApi(MarkdownPlugin).markdown.deserialize(sanitized);
    if (deserializedValue && deserializedValue.length > 0) {
      editor.tf.setValue(deserializedValue);
    }
  }, [editor, initialValue]);

  const handleChange = React.useCallback(
    ({ value: newValue }: { value: Value }) => {
      if (onChange) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  return (
    <div className={className} style={style}>
      <Plate editor={editor} onChange={handleChange}>
        <EditorContainer 
          variant="demo" 
          className="plate-editor-container"
          style={{
            backgroundColor: 'var(--input-background)',
            borderColor: 'var(--input-border)'
          }}
        >
          <Editor
            placeholder={placeholder}
            variant="demo"
            className="min-h-[300px]" 
            style={{
              backgroundColor: 'var(--input-background)',
              color: 'var(--text-primary)'
            }}
          />
        </EditorContainer>
      </Plate>
    </div>
  );
}

// Utility functions to convert between Plate and markdown
// Note: These require an editor instance, so they're used within components that have editor context
import { createSlateEditor } from 'platejs';
import type { Descendant, Element as SlateElement, Text as SlateText } from 'slate';
import { Element, Text } from 'slate';

// Remove inline color/background-color styles from HTML-in-Markdown to avoid overriding theme
export function stripInlineColorStyles(input: string): string {
  if (!input) return '';

  let output = input;

  // Remove color and background-color declarations from any style attribute
  output = output.replace(/style\s*=\s*"([^"]*)"/gi, (_m, styles: string) => {
    const cleaned = styles
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => !/^\s*(color|background-color)\s*:/i.test(s))
      .join('; ');
    return cleaned ? `style="${cleaned}"` : '';
  });

  // Unwrap spans that only existed for color styling (now attribute-less)
  output = output.replace(/<span\s*>([\s\S]*?)<\/span>/gi, '$1');

  // Also normalize cases like <span class="" style=""> -> remove empty attributes
  output = output
    .replace(/\s+class="\s*"/gi, '')
    .replace(/\s+style="\s*"/gi, '');

  return output;
}

// Helpers to identify and prune empty paragraph nodes (only whitespace/zero-width chars)
const ZERO_WIDTH_REGEX = /[\u200B\uFEFF\u00A0]/g; // zero-width space, BOM, nbsp
function isTextEmpty(text: string | undefined): boolean {
  if (!text) return true;
  return text.replace(ZERO_WIDTH_REGEX, '').trim().length === 0;
}

type AnyNode = Descendant;
export function pruneEmptyParagraphs(value: Value): Value {
  const isTextNode = (n: AnyNode): n is SlateText => {
    return Text.isText(n);
  };

  const isElementNode = (n: AnyNode): n is SlateElement & { type?: string } => {
    return Element.isElement(n);
  };

  const pruneNode = (node: AnyNode | AnyNode[]): AnyNode | AnyNode[] | null => {
    if (!node) return null;

    if (Array.isArray(node)) {
      const prunedChildren = node
        .map((n: AnyNode) => pruneNode(n))
        .filter(Boolean) as AnyNode[];
      return prunedChildren;
    }

    if (isTextNode(node)) {
      return node; // handled at element level
    }

    if (isElementNode(node)) {
      const children = node.children
        .map((c: AnyNode) => pruneNode(c))
        .filter(Boolean) as AnyNode[];

      const allChildrenEmpty =
        children.length === 0 ||
        children.every((c: AnyNode) => isTextNode(c) && isTextEmpty(c.text));

      if (node.type === 'p' && allChildrenEmpty) {
        return null;
      }

      return { ...node, children };
    }

    return node;
  };

  const pruned = (pruneNode(value) as AnyNode[]) || [];
  // Ensure we don't return an empty document
  if (!pruned || pruned.length === 0) {
    return defaultValue;
  }
  return pruned as Value;
}

export function plateValueToMarkdown(value: Value): string {
  if (!value || !Array.isArray(value)) return '';
  // Prune empty paragraphs to avoid saving <p>\u200B</p> gaps
  const cleanedValue = pruneEmptyParagraphs(value);
  
  // Always serialize using a temporary editor to avoid mutating live state
  const tempEditor = createSlateEditor({ plugins: EditorKit, value: cleanedValue });
  const md = tempEditor.getApi(MarkdownPlugin).markdown.serialize() || '';
  return stripInlineColorStyles(md);
}

export function markdownToPlateValue(markdown: string, editor?: PlateEditorType): Value {
  if (!markdown.trim()) return defaultValue;
  
  // If we don't have an editor, create a temporary one just for deserialization
  if (!editor) {
    const tempEditor = createSlateEditor({ plugins: EditorKit, value: defaultValue });
    const sanitized = stripInlineColorStyles(markdown);
    const deserialized = tempEditor.getApi(MarkdownPlugin).markdown.deserialize(sanitized) || defaultValue;
    return pruneEmptyParagraphs(deserialized);
  }
  
  const sanitized = stripInlineColorStyles(markdown);
  const deserialized = editor.getApi(MarkdownPlugin).markdown.deserialize(sanitized) || defaultValue;
  return pruneEmptyParagraphs(deserialized);
}

