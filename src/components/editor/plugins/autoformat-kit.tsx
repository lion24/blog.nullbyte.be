'use client';

import { createSlatePlugin, createTextSubstitutionInputRule } from 'platejs';

import { notInCodeBlock } from '@/components/editor/plugins/input-rule-utils';

// Block and mark markdown shortcuts are registered on their feature plugins
// (basic-blocks-kit, basic-marks-kit, list-kit, code-block-kit) as Plate 53
// `inputRules`. This kit only holds the plain text substitutions that the
// removed `@platejs/autoformat` rule sets used to provide.

const smartQuotes = [
  { format: ['“', '”'], match: '"' },
  { format: ['‘', '’'], match: "'" },
] as const;

const punctuation = [
  { format: '—', match: '--' },
  { format: '…', match: '...' },
  { format: '»', match: '>>' },
  { format: '«', match: '<<' },
];

const legal = [
  { format: '™', match: ['(tm)', '(TM)'] },
  { format: '®', match: ['(r)', '(R)'] },
  { format: '©', match: ['(c)', '(C)'] },
  { format: '™', match: '&trade;' },
  { format: '®', match: '&reg;' },
  { format: '©', match: '&copy;' },
  { format: '§', match: '&sect;' },
];

const arrows = [
  { format: '→', match: '->' },
  { format: '←', match: '<-' },
  { format: '⇒', match: '=>' },
  { format: '⇐', match: ['<=', '≤='] },
];

const math = [
  // comparison
  { format: '≯', match: '!>' },
  { format: '≮', match: '!<' },
  { format: '≥', match: '>=' },
  { format: '≤', match: '<=' },
  { format: '≱', match: '!>=' },
  { format: '≰', match: '!<=' },
  // equality
  { format: '≠', match: '!=' },
  { format: '≡', match: '==' },
  { format: '≢', match: ['!==', '≠='] },
  { format: '≈', match: '~=' },
  { format: '≉', match: '!~=' },
  // operations
  { format: '±', match: '+-' },
  { format: '‰', match: '%%' },
  { format: '‱', match: ['%%%', '‰%'] },
  { format: '÷', match: '//' },
  // fractions
  { format: '½', match: '1/2' },
  { format: '⅓', match: '1/3' },
  { format: '¼', match: '1/4' },
  { format: '⅕', match: '1/5' },
  { format: '⅙', match: '1/6' },
  { format: '⅐', match: '1/7' },
  { format: '⅛', match: '1/8' },
  { format: '⅑', match: '1/9' },
  { format: '⅒', match: '1/10' },
  { format: '⅔', match: '2/3' },
  { format: '⅖', match: '2/5' },
  { format: '¾', match: '3/4' },
  { format: '⅗', match: '3/5' },
  { format: '⅜', match: '3/8' },
  { format: '⅘', match: '4/5' },
  { format: '⅚', match: '5/6' },
  { format: '⅝', match: '5/8' },
  { format: '⅞', match: '7/8' },
  // superscript / subscript symbols
  { format: '°', match: '^o' },
  { format: '⁺', match: '^+' },
  { format: '⁻', match: '^-' },
  { format: '₊', match: '~+' },
  { format: '₋', match: '~-' },
  // superscript / subscript digits
  ...['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'].map((format, i) => ({
    format,
    match: `^${i}`,
  })),
  ...['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'].map((format, i) => ({
    format,
    match: `~${i}`,
  })),
];

export const AutoformatKit = [
  createSlatePlugin({
    key: 'textSubstitution',
    inputRules: [
      createTextSubstitutionInputRule({
        enabled: notInCodeBlock,
        patterns: [...smartQuotes, ...punctuation, ...legal, ...arrows, ...math],
      }),
    ],
  }),
];
