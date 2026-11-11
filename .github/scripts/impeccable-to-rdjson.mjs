#!/usr/bin/env node
// Converts `impeccable detect --json`'s findings array into reviewdog's
// rdjson format (https://github.com/reviewdog/reviewdog/tree/master/proto/rdf#rdjson),
// so ci/design-detector can post findings as inline PR review comments.
// See https://impeccable.style/docs/detector/
//
// Usage: node impeccable-to-rdjson.mjs <findings.json> > out.rdjson.json

import { readFileSync } from 'node:fs'
import { relative, isAbsolute } from 'node:path'

const inputPath = process.argv[2]
const root = process.env.GITHUB_WORKSPACE || process.cwd()

// Hidden in the rendered comment, but lets delete-stale-impeccable-comments.js
// find and remove this job's own comments from an earlier run on the same
// PR. Keep this literal in sync with that file if either changes.
const MARKER = '<!-- impeccable-detector -->'

function loadFindings() {
  try {
    const data = JSON.parse(readFileSync(inputPath, 'utf8'))
    return Array.isArray(data) ? data : (data.findings ?? [])
  } catch {
    // Missing or unparsable input (e.g. the detector crashed before writing
    // valid JSON): report no diagnostics. The detect step's own exit code
    // already fails the job; this script just must not also fail it.
    return []
  }
}

function toPath(file) {
  if (!file) return undefined
  return isAbsolute(file) ? relative(root, file) : file
}

const diagnostics = loadFindings()
  .filter((finding) => toPath(finding.file))
  .map((finding) => {
    const lines = [MARKER, `**${finding.name ?? finding.antipattern ?? 'Impeccable finding'}**`]
    if (finding.description) lines.push(finding.description)
    if (finding.snippet) lines.push('```\n' + finding.snippet + '\n```')
    if (!finding.advisory) {
      lines.push(
        'To accept this intentionally, add an `ignoreValue` entry to `.impeccable/config.json` with a reason (see the existing entries).',
      )
    }
    const line = Number.isInteger(finding.line) && finding.line > 0 ? finding.line : 1
    return {
      message: lines.join('\n\n'),
      location: { path: toPath(finding.file), range: { start: { line } } },
      severity: finding.advisory ? 'INFO' : 'ERROR',
      code: finding.antipattern ? { value: finding.antipattern } : undefined,
    }
  })

process.stdout.write(
  JSON.stringify({
    source: { name: 'impeccable', url: 'https://impeccable.style/docs/detector/' },
    diagnostics,
  }) + '\n',
)
