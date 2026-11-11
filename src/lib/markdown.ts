import 'server-only'

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkUnwrapImages from 'remark-unwrap-images'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeShiki from '@shikijs/rehype'
import rehypeStringify from 'rehype-stringify'
import { VFile } from 'vfile'
import type { Root, Element, ElementContent } from 'hast'

// Sanitization schema applied BEFORE Shiki. We allow the editor's exported
// markdown HTML (already cleaned of color/background-color in preprocess) to
// keep loading hints on images. We do NOT allow generic `style` here — the
// editor's color styles are dropped earlier; Shiki adds its style attributes
// AFTER sanitize so it's unaffected.
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    img: [
      ...((defaultSchema.attributes && defaultSchema.attributes.img) || []),
      'loading',
      'decoding',
      'width',
      'height',
    ],
  },
}

// Strip remnants of inline color/background-color styles produced by the
// editor when content is exported as markdown. Same regexes as the prior
// client component — moved verbatim so behaviour stays identical.
function preprocess(content: string): string {
  return content
    .replace(/<span[^>]*>\s*\*\s+([^<]+)<\/span>/g, '* $1')
    .replace(/<span[^>]*>\s*(\d+)\.\s+([^<]+)<\/span>/g, '$1. $2')
    .replace(/<span[^>]*>\s*<\/span>/g, '')
    .replace(/style\s*=\s*"([^"]*)"/gi, (_m, styles: string) => {
      const cleaned = styles
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((s) => !/^\s*(color|background-color)\s*:/i.test(s))
        .join('; ')
      return cleaned ? `style="${cleaned}"` : ''
    })
    .replace(/<span\s*>([\s\S]*?)<\/span>/gi, '$1')
    .replace(/\s+class="\s*"/gi, '')
    .replace(/\s+style="\s*"/gi, '')
}

// Languages we want eagerly available so the first request after a cold
// start does not pay for grammar download. Anything not in this list still
// works — Shiki loads on demand. Add more as you start using them.
const SHIKI_LANGS = [
  'bash',
  'css',
  'diff',
  'dockerfile',
  'go',
  'graphql',
  'html',
  'ini',
  'java',
  'javascript',
  'json',
  'jsx',
  'kotlin',
  'markdown',
  'nginx',
  'php',
  'python',
  'ruby',
  'rust',
  'scss',
  'shell',
  'sql',
  'svelte',
  'swift',
  'tsx',
  'typescript',
  'vue',
  'yaml',
] as const

// Single dark theme regardless of page theme. Code blocks always have a dark
// background — this matches the VS Code / many-MDX-blogs convention and
// preserves token contrast in light mode (where a light syntax theme on a
// near-white background washes out). Shiki bakes the colors directly into
// inline style attributes, so no CSS theming work is needed.
const SHIKI_THEME = 'github-dark'

/** Labels the article page passes in; without them rehypeArticle does nothing. */
export type ArticleLabels = {
  /** e.g. "@@ 01 / 04 · 3 code blocks @@" */
  hunk: (n: number, total: number, codeBlocks: number) => string
  anchor: string
  copy: string
  /** The page's own title: a body h1 repeating it is dropped, any other body h1 becomes an h2. */
  title?: string
}

export type ArticleSection = { id: string; text: string; level: 2 | 3; n?: number }

declare module 'vfile' {
  interface DataMap {
    articleLabels?: ArticleLabels
    articleSections?: ArticleSection[]
  }
}

const textOf = (node: ElementContent | Root): string =>
  node.type === 'text' ? node.value : 'children' in node ? node.children.map((c) => textOf(c as ElementContent)).join('') : ''

// Shiki splices its output in as a nested root, so walk anything with children, not only elements.
type Walkable = ElementContent | Root
const childrenOf = (node: Walkable): ElementContent[] => ('children' in node ? (node.children as ElementContent[]) : [])
const countPre = (node: Walkable): number =>
  (node.type === 'element' && node.tagName === 'pre' ? 1 : 0) + childrenOf(node).reduce((n, c) => n + countPre(c), 0)

const el = (tagName: string, properties: Element['properties'], children: ElementContent[] = []): Element => ({
  type: 'element',
  tagName,
  properties,
  children,
})

/**
 * Build Log article structure (runs after Shiki, on trusted output):
 * - h2/h3 get stable ids and a self-link anchor; the list is returned as file.data.articleSections;
 * - every h2 is preceded by a numbered hunk line with its section's code-block count;
 * - every code block is wrapped in a toolbar with its language and a copy button.
 */
function rehypeArticle() {
  return (tree: Root, file: VFile) => {
    const labels = file.data.articleLabels
    if (!labels) return
    const used = new Map<string, number>()
    const slugify = (text: string) => {
      const base =
        text
          .normalize('NFKD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-') || 'section'
      const seen = used.get(base) ?? 0
      used.set(base, seen + 1)
      return seen ? `${base}-${seen}` : base
    }

    // The page owns the only h1 (the commit header). Demote body h1s; drop one that just repeats the title.
    const norm = (t: string) => t.trim().toLowerCase().replace(/\s+/g, ' ')
    tree.children = tree.children.filter((node) => {
      if (node.type !== 'element' || node.tagName !== 'h1') return true
      if (labels.title && norm(textOf(node)) === norm(labels.title)) return false
      node.tagName = 'h2'
      return true
    })

    const kids = tree.children as ElementContent[]
    const h2s = kids.filter((k) => k.type === 'element' && k.tagName === 'h2').length
    const sections: ArticleSection[] = []
    const out: ElementContent[] = []
    let n = 0

    kids.forEach((node, i) => {
      if (node.type === 'element' && (node.tagName === 'h2' || node.tagName === 'h3')) {
        const text = textOf(node).trim()
        const id = slugify(text)
        node.properties = { ...node.properties, id }
        node.children.push(
          el('a', { className: ['bl-anchor'], href: `#${id}`, ariaLabel: `${labels.anchor}: ${text}` }, [
            { type: 'text', value: '#' },
          ]),
        )
        if (node.tagName === 'h2') {
          n++
          let code = 0
          for (let j = i + 1; j < kids.length; j++) {
            const next = kids[j]
            if (next.type === 'element' && next.tagName === 'h2') break
            code += countPre(next)
          }
          // A lone section's position tells the reader nothing, so it gets no hunk line.
          if (h2s > 1) {
            out.push(el('p', { className: ['bl-hunk'], ariaHidden: 'true' }, [{ type: 'text', value: labels.hunk(n, h2s, code) }]))
          }
          sections.push({ id, text, level: 2, n })
        } else {
          sections.push({ id, text, level: 3 })
        }
      }
      out.push(node)
    })

    const wrapCode = (nodes: ElementContent[]): ElementContent[] =>
      nodes.map((node) => {
        if (node.type !== 'element') {
          const nested = node as unknown as Walkable
          if ('children' in nested) (nested as Root).children = wrapCode(childrenOf(nested)) as Root['children']
          return node
        }
        if (node.tagName === 'pre') {
          const lang = String(node.properties?.['data-language'] ?? node.properties?.dataLanguage ?? '')
          const bar = el('div', { className: ['bl-code__bar'] }, [
            el('span', { className: ['bl-code__lang'] }, [{ type: 'text', value: lang && lang !== 'text' ? lang : '' }]),
            el('button', { type: 'button', className: ['bl-code__copy'], dataCopy: '' }, [{ type: 'text', value: labels.copy }]),
          ])
          return el('div', { className: ['bl-code'] }, [bar, node])
        }
        node.children = wrapCode(node.children)
        return node
      })

    tree.children = wrapCode(out) as Root['children']
    file.data.articleSections = sections
  }
}

// rehype-sanitize must run BEFORE rehype-shiki: sanitize cleans untrusted
// HTML embedded in the markdown, then Shiki tokenizes code blocks and emits
// trusted output with its own style attributes that we preserve through
// stringify. Reversing the order would strip Shiki's colors.
const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkUnwrapImages)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeShiki, {
    theme: SHIKI_THEME,
    langs: [...SHIKI_LANGS],
    defaultLanguage: 'text',
    fallbackLanguage: 'text',
    transformers: [
      {
        // Record the block's language so the article toolbar can label it.
        pre(node) {
          node.properties['data-language'] = this.options.lang
        },
      },
    ],
  })
  .use(rehypeArticle)
  .use(rehypeStringify, { allowDangerousHtml: true })

const htmlProcessor = unified()
  .use(remarkParse)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeArticle)
  .use(rehypeStringify, { allowDangerousHtml: true })

export async function renderMarkdown(content: string): Promise<string> {
  if (!content) return ''
  const file = await markdownProcessor.process(preprocess(content))
  return String(file)
}

export async function renderHtml(content: string): Promise<string> {
  if (!content) return ''
  const file = await htmlProcessor.process(preprocess(content))
  return String(file)
}

/**
 * Render a post body for the Build Log article page: same pipeline as
 * renderMarkdown/renderHtml, plus hunk lines, heading anchors, code toolbars,
 * and the section list for the contents index.
 */
export async function renderArticle(
  content: string,
  labels: ArticleLabels,
): Promise<{ html: string; sections: ArticleSection[] }> {
  if (!content) return { html: '', sections: [] }
  const trimmed = content.trim()
  const isHtmlDocument = trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')
  const file = new VFile({ value: preprocess(content), data: { articleLabels: labels } })
  const result = await (isHtmlDocument ? htmlProcessor : markdownProcessor).process(file)
  return { html: String(result), sections: result.data.articleSections ?? [] }
}
