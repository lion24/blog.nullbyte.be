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

const SHIKI_THEMES = {
  light: 'github-light',
  dark: 'github-dark',
} as const

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
    themes: SHIKI_THEMES,
    langs: [...SHIKI_LANGS],
    defaultLanguage: 'text',
    fallbackLanguage: 'text',
  })
  .use(rehypeStringify, { allowDangerousHtml: true })

const htmlProcessor = unified()
  .use(remarkParse)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSanitize, sanitizeSchema)
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
