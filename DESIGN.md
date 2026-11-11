---
name: NullByte
description: Tutorials & Engineering Insights — a bilingual engineer's notebook.
colors:
  ink: "#1f2024"
  ink-hover: "#2c2e34"
  ink-focus: "#3b3e46"
  paper: "#f7f6f3"
  paper-surface: "#fdfcfa"
  paper-recessed: "#f1efe9"
  paper-rule: "#e8e6e0"
  paper-rule-hover: "#d4d1c8"
  input-rule: "#dcdad3"
  graphite: "#57534e"
  pencil: "#6e6961"
  placeholder: "#a8a29e"
  focus-ring: "#94a3b8"
  margin-fuchsia: "#a21caf"
  margin-fuchsia-hover: "#86198f"
  danger: "#b91c1c"
  success: "#15803d"
  warning: "#b45309"
  slate-page: "#13161c"
  slate-surface: "#1c1f27"
  slate-elevated: "#262a33"
  slate-rule: "#2a2f3a"
  slate-rule-hover: "#3a4051"
  moonlight: "#e6e8ee"
  slate-secondary: "#a8acb6"
  slate-tertiary: "#878d99"
  night-indigo: "#7891f6"
  night-indigo-hover: "#93a8f8"
  night-fuchsia: "#e879f9"
typography:
  display:
    fontFamily: "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.1
  headline:
    fontFamily: "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
  code:
    fontFamily: "Geist Mono, 'SF Mono', Monaco, Consolas, 'Liberation Mono', monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  hero: "16px"
  pill: "9999px"
spacing:
  gutter: "16px"
  card: "24px"
  grid-gap: "24px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper-surface}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.ink-hover}"
  button-secondary:
    backgroundColor: "{colors.paper-recessed}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-cta:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper-surface}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  card-post:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "{spacing.card}"
  chip-category:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  link-tag:
    textColor: "{colors.margin-fuchsia}"
    typography: "{typography.label}"
  input:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "4px 12px"
    height: "36px"
  nav-bar:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.graphite}"
    height: "64px"
---

# Design System: NullByte

## Overview

**Creative North Star: "The Engineer's Notebook"**

NullByte reads like a well-kept engineering notebook: warm paper, calm ink, and code given the same care as prose. The system exists to carry long, technical, hands-on tutorials, so almost everything recedes. Surfaces are tonal rather than outlined. Type is a single sans family (Geist) with its mono sibling for code. Color is held back until it means something.

The notebook has two lighting conditions. By day (light theme), it is warm off-white paper with dark-slate ink, and the primary action *is* the ink. By night (dark theme), it is layered slate with moonlight text, and a refined indigo takes over as the accent. Both themes share one grammar: page < surface < recessed, soft rules instead of hard borders, and shadows that only whisper.

One mark breaks the restraint on purpose. The fuchsia `#tag` is the margin annotation: the one saturated note on the page. It lets readers jump sideways to related work.

**Key Characteristics:**
- Warm-neutral paper (light) / layered cool slate (dark), never pure white or pure black.
- Depth through surface tone first, soft shadow second.
- Ink-as-primary in light mode; indigo-as-primary in dark mode.
- A single accent of fuchsia, reserved for tags.
- Reading comfort is the deciding factor: generous line-height (1.8 for paragraphs), a capped article width (`max-w-4xl`).
- Code is a first-class surface: recessed background, soft rule, Geist Mono.

## Colors

A warm-paper / cool-slate pair with a single ink-or-indigo accent and one fuchsia margin mark.

### Primary
- **Ink** (light): primary CTA, category chips, active toolbar state, and blockquote rule in light mode. It matches body text so dark buttons feel intentional rather than loud.
- **Night Indigo** (dark): the dark-theme primary. Refined and less acid than blue-500. Used for CTAs, links, focus ring, and input focus border.

### Secondary
- **Margin Fuchsia** (light) / **Night Fuchsia** (dark): tags only (`#tag` links on cards and posts, tag pills). Hover deepens in light mode and brightens in dark mode.

### Neutral
- **Paper**: the page background in light mode. A touch warmer than surfaces.
- **Paper Surface**: nav, footer, cards, popovers, inputs. Gently lifted off the page.
- **Paper Recessed**: code blocks, inline code, blockquotes, secondary buttons, muted fills.
- **Paper Rule / Rule Hover**: soft warm dividers; the hover step on cards and outlined buttons.
- **Graphite**: secondary text (excerpts, nav links, subtitles).
- **Pencil**: tertiary text (dates, reading time, meta).
- **Slate Page / Surface / Elevated**: the dark-theme L0 / L1 / L2 tiers, mirroring paper / surface / recessed.
- **Moonlight**: dark-theme primary text. Soft off-white, never `#fff`.
- **Focus Ring** (light): calm slate-blue keyboard focus ring.

### Status
- **Danger**, **Success**, **Warning**: semantic only. Dark mode uses lighter tints (`#f87171`, `#4ade80`, `#fbbf24`).

### Named Rules
**The Two Lights Rule.** Primary means *ink* by day and *indigo* by night. Always use `var(--primary)`; never hard-code either hex in a component.

**The Margin Mark Rule.** Fuchsia belongs to tags and nothing else. A second fuchsia element on a screen dilutes the one thing it signals.

**The No Pure Extremes Rule.** No `#ffffff` page or `#000000` text in either theme. Paper and slate are the floor and the ceiling.

### Known drift (fix, don't copy)
- Tailwind's `dark:` variant is bound to a `.dark` class, but the theme switch sets `data-theme` / follows `prefers-color-scheme`. `dark:` utilities never fire. Theme through the CSS variables instead.
- The shadcn `--brand`, `--chart-*`, `--sidebar-*` and `--highlight` tokens are scaffold defaults with no confirmed role. Don't build on them.
- `globals.css` forcibly remaps any `bg-white`/`bg-black`/`text-white`/`text-black` class. Don't rely on those utilities. Use the tokens.

## Typography

**Display Font:** Geist (with system sans fallback)
**Body Font:** Geist
**Label/Mono Font:** Geist Mono for code; labels use Geist

**Character:** One neutral, contemporary grotesk carries everything. Hierarchy comes from weight and size, not from a contrasting family. The mono sibling keeps code visually related to prose.

### Hierarchy
- **Display** (700, 3rem, ~1.1): the home hero headline only.
- **Headline** (600, 2.25rem h1 → 1.875rem h2 → 1.5rem h3, 1.3): post titles and section headings. Headings are 600; card titles step up to 700.
- **Title** (700, 1.25rem, tight): post-card titles.
- **Body** (400, 1rem, 1.8 for paragraphs; 1.6 base): article prose, capped by the `max-w-4xl` article column. Excerpts drop to 0.875rem.
- **Label** (500, 0.75rem): category chips, dates, reading time. Tags use the same size at 700.
- **Code** (400, 0.875rem / 0.875em inline, 1.7): code blocks and inline code.

### Named Rules
**The One Family Rule.** Geist and Geist Mono only. Hierarchy is weight and scale, never a second display face.

## Layout

A centered Tailwind `container` with a 16px side gutter. Listing pages lay post cards out in a responsive grid: one column on mobile, 2 at `md`, 3 at `lg`, with a 24px gap. Article pages narrow to a `max-w-4xl` reading column. Vertical rhythm comes in generous 64px section bands (`py-16`), with 32px page padding (`py-8`). The nav is a fixed-height 64px bar. Its secondary links collapse below `md`, leaving brand, language switcher, theme toggle, and auth.

Headings carry `scroll-margin-top` (6rem / 5rem / 4rem for h1–h3) so in-page anchors land clear of the nav.

## Elevation & Depth

Mostly flat. Depth is carried by surface tone: page → surface → recessed in light, L0 → L1 → L2 slate in dark. Shadows are warm-tinted (light) or deep-black (dark) and kept low-spread. At rest, cards and the nav sit on `shadow-sm`. Hover raises a card to `shadow-md` and darkens its rule. `shadow-lg` is reserved for the hero CTAs.

### Shadow Vocabulary
- **Rest** (`--shadow-sm`): nav bar, post cards at rest.
- **Hover lift** (`--shadow-md`): post-card hover only.
- **Raised** (`--shadow-lg`): hero call-to-action buttons.

### Named Rules
**The Tone Before Shadow Rule.** Reach for a surface tier before reaching for a shadow. A shadow appears at rest only as a whisper (`shadow-sm`) and grows only in response to hover.

## Shapes

Gently rounded everywhere, never sharp and never bubbly. The base radius is 10px (`--radius`), stepping 6 / 8 / 10 / 14px. Cards and buttons sit at 8px, hero CTAs at 10px, and the home hero panel at 16px. Inline code gets a 4px corner and code blocks 8px. Category chips are full pills, the only fully round form. Borders are 1px soft rules in the rule color. The blockquote's 4px primary-colored left rule is the one heavy stroke in the system.

## Components

### Buttons
Refined and restrained.
- **Shape:** gently rounded (8px); hero CTAs 10px.
- **Primary:** primary fill with paper-surface text, 36px tall, 8px × 16px padding, 0.875rem/500. In light mode this is ink; in dark mode it is indigo.
- **Hover / Focus:** hover steps to `--primary-hover`. Focus shows a keyboard-only `:focus-visible` ring (2px, `--ring`, 2px offset). Mouse clicks leave no outline.
- **Secondary / Outline / Ghost:** recessed fill, outlined surface, or transparent. Each takes the recessed tone on hover.
- **Hero CTA:** 12px × 24px, `shadow-lg`. Paired as primary ("All posts") + outlined surface ("GitHub Profile").

### Chips
- **Category chip:** pill, primary fill, inverse text, 0.75rem/500, 4px × 10px. Sits at 0.9 opacity and becomes fully opaque with a 1.05 scale on hover.
- **Tag link:** not a chip. Bold 0.75rem fuchsia `#name` text, underlined on hover. At most 3 per card, then `+N`.

### Cards / Containers
- **Post card:** surface background, 1px rule border, 8px radius, 24px padding, `shadow-sm`. Inside, top to bottom: categories, then a title (1.25rem/700) that turns primary on hover, then a 0.875rem graphite excerpt (150-char cap), then a ruled footer with pencil meta and tags plus a "Read →" link.
- **Hover:** `shadow-md` and rule-hover border, 200ms ease.

### Inputs / Fields
- **Style:** surface background, 1px input rule, 8px radius, 36px tall, placeholder in a warm grey.
- **Focus:** border shifts to the ring color with a 3px soft ring (`ring/50`).
- **Error / Disabled:** a destructive border and ring tint for errors; disabled at 0.5–0.6 opacity with a not-allowed cursor.

### Navigation
- **Style:** a 64px surface bar with a bottom rule and `shadow-sm`. The bold 1.25rem brand wordmark sits on the left, with graphite links next to it that turn to primary text on hover. On the right: language switcher, theme toggle, auth.
- **Mobile:** below `md`, the text links hide and the utilities remain.

### Code Block (signature)
- A recessed surface, 1px rule, 8px radius, 16px padding, Geist Mono 0.875rem/1.7, horizontal scroll with a slim styled scrollbar. Shiki-highlighted blocks keep their dark token theme in both modes and take only the layout from the system. Inline code is a 4px-radius recessed lozenge with a rule, at 0.875em, that never wraps.

## Do's and Don'ts

### Do:
- **Do** drive every color from CSS custom properties (`var(--primary)`, `var(--background-secondary)` …) so both themes stay in sync.
- **Do** express depth with the surface tiers (paper → surface → recessed / L0 → L1 → L2) before adding any shadow.
- **Do** keep keyboard focus on `:focus-visible` with the `--ring` color, 2px, 2px offset.
- **Do** cap article content at the `max-w-4xl` column with 1.8 paragraph line-height.
- **Do** treat code as first-class: recessed surface, soft rule, Geist Mono.

### Don't:
- **Don't** hard-code accent hexes or reach for raw Tailwind palette classes (`gray-*`, `blue-*`). Use the tokens, and never rely on `dark:` utilities.
- **Don't** use fuchsia for anything but tags.
- **Don't** use pure `#ffffff` / `#000000` surfaces or text.
- **Don't** introduce a second typeface. Geist and Geist Mono carry the whole system.
- **Don't** put structural shadows on resting elements beyond `shadow-sm`. Lift is a hover response.
