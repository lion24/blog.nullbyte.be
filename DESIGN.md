---
name: NullByte
description: Tutorials & Engineering Insights — the build log of things actually built.
colors:
  ground: "#e9edf1"
  ground-pressed: "#dde2e8"
  ink: "#0d1117"
  ink-secondary: "#363d48"
  ink-tertiary: "#555e6b"
  on-accent: "#ffffff"
  accent: "#1f4fd8"
  lane-vermilion: "#e8432a"
  lane-cobalt: "#1f4fd8"
  lane-green: "#1b8a4b"
  lane-violet: "#7b3fe4"
  lane-other: "#78818e"
  ground-dark: "#171819"
  ground-pressed-dark: "#222325"
  ink-dark: "#eaeef3"
  ink-secondary-dark: "#bcc3ce"
  ink-tertiary-dark: "#9aa3b0"
  on-accent-dark: "#171819"
  accent-dark: "#5b85ff"
  lane-vermilion-dark: "#ff5a3d"
  lane-cobalt-dark: "#5b85ff"
  lane-green-dark: "#2fbf6e"
  lane-violet-dark: "#a678ff"
  lane-other-dark: "#6b7480"
typography:
  display:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "5.5rem"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 750
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  footer-mark:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "3.25rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.04em"
  wordmark:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    letterSpacing: "-0.03em"
  lead:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 400
    lineHeight: 1.45
  action:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    letterSpacing: "-0.01em"
  repo-line:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  nav-link:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
  data:
    fontFamily: "Geist Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.9
    fontFeature: "tnum"
  data-sm:
    fontFamily: "Geist Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "0.8125rem"
    fontWeight: 600
    fontFeature: "tnum"
rounded:
  mark: "2px"
  swatch: "3px"
  chip: "6px"
  button: "8px"
  pill: "999px"
  node: "50%"
spacing:
  gutter: "clamp(16px, 3.5vw, 48px)"
  pill-gap: "6px"
  meta-gap: "14px"
  row-top: "18px"
  row-bottom: "26px"
  log-top: "clamp(24px, 4vw, 44px)"
  page-bottom: "clamp(48px, 8vw, 112px)"
components:
  nav-bar:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    height: "64px"
  nav-link:
    textColor: "{colors.ink-secondary}"
    typography: "{typography.nav-link}"
    padding: "4px 0"
  nav-link-hover:
    textColor: "{colors.ink}"
  branch-pill:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "4px 11px 4px 8px"
    height: "40px"
  branch-pill-hover:
    backgroundColor: "{colors.ground-pressed}"
  branch-pill-checked:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
  head-chip:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.chip}"
    padding: "3px 10px"
  head-title:
    textColor: "{colors.ink}"
    typography: "{typography.display}"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    typography: "{typography.action}"
    rounded: "{rounded.button}"
    padding: "0 26px"
    height: "56px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
  log-row:
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    padding: "18px 0 26px"
  topic-link:
    textColor: "{colors.ink-secondary}"
  topic-link-hover:
    textColor: "{colors.ink}"
  footer:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.body}"
---

# Design System: NullByte

## Overview

**Creative North Star: "The Build Log"**

NullByte is a build log: every post is a commit in the history of something actually built, newest first, drawn as `git log --graph` at poster scale. Topics are branches. Each branch is a full-saturation rail that owns its column from the root of the log up to the newest post on it, and every post sits on its rails as a thick ink-ring node. The latest post is HEAD and is set at headline scale with its real stats; older posts follow as log rows separated by 2px ink rules.

The material is paper-flat. A pale steel ground by day and deep graphite by night, near-black (or near-white) ink, and colour reserved for the rails. Commit messages are set in a heavy, tightly tracked grotesk (Schibsted Grotesk). Monospace (Geist Mono) appears only on the data line: hashes, dates and counts. Nothing floats: there are no cards, no shadows and no rounded panels. Structure comes from ink rules and the rails themselves.

The world refuses the blog template of a hero image over a row of equal cards. It also refuses the dark-terminal costume: no neon, no glow, no monospace headlines, and no fake git history (the short hash is a display id derived from the post id).

**Key Characteristics:**
- Pale steel ground (light) / deep graphite ground (dark), with ink rather than tinted surfaces.
- Four full-saturation topic rails (vermilion, cobalt, green, violet) plus one neutral "other" rail.
- Heavy, tightly tracked Schibsted Grotesk for titles; Geist Mono only for the data line.
- 2px ink rules as the only structure; no cards, no shadows, no rounded panels.
- Rails draw up from the root to HEAD once on load; hovering a row widens its rail.
- The branch switcher filters the log by topic with pure CSS, enhanced by a view transition.

## Colors

Ink on steel, with four saturated rails as the only colour on the page and cobalt as the single interactive accent.

### Primary
- **Ink** (`ink` / `ink-dark`): all titles, the 2px rules, node rings, the selected branch pill, the HEAD chip and the primary button fill. Actions are ink, not colour.
- **Cobalt Accent** (`accent` / `accent-dark`): hover fill of the primary button, focus outlines, text selection, and the `--ring` / `--primary` that legacy nav widgets read inside the chrome. On actions and links it is a response, never the resting colour. (It shares its value with the cobalt rail, which is a topic colour, not the accent.)

### Secondary (the rails)
- **Vermilion** (`lane-vermilion`), **Cobalt** (`lane-cobalt`), **Green** (`lane-green`), **Violet** (`lane-violet`): lanes 0–3, assigned to the four busiest tags in rank order (most posts first, ties broken by the most recent post). They appear as rails, filled secondary nodes, branch-pill swatches and the small square before each topic link.
- **Other** (`lane-other`): lane 4, the neutral rail every remaining tag folds into, and the rail for untagged posts.

### Neutral
- **Pale Steel** (`ground`): the page, nav and footer ground. Node centres are punched out in it.
- **Pressed Steel** (`ground-pressed`): hover field on branch pills and the pressed tone legacy nav widgets pick up.
- **Ink Secondary** (`ink-secondary`, 9.3:1 on ground): excerpts, the repository line, nav and footer links at rest, the stat line, the hash.
- **Ink Tertiary** (`ink-tertiary`, 5.6:1 on ground): log-row meta (hash, date, reading time), the end-of-log line, footer column headings, separators.
- **On Accent** (`on-accent`): text on the cobalt hover fill and on selection.

### Named Rules
**The Rail Rule.** There are exactly four topic rails and one "other" rail. Lane colour follows tag rank (the four busiest tags), not tag identity, so a tag can change colour as the log grows. A fifth colour is never added; extra topics fold into "other".

**The Named Topic Rule.** Colour never identifies a topic alone. Every swatch sits beside the topic's name in text: the branch pill names its branch, the topic link names its tag, the HEAD chip names the post's subject.

**The Ink First Rule.** Resting actions and selected states are ink. The cobalt accent appears on actions and links only as a response (hover, focus, selection), never as a resting button or link colour.

### Theme mechanism
Dark mode is `data-theme="dark"`, or `prefers-color-scheme: dark` when no explicit `data-theme="light"` is set. The `-dark` values live in two identical blocks in `globals.css` (keep them identical), and Tailwind's `dark:` variant is a custom variant targeting the same two conditions. There is no `.dark` class.

## Typography

**Display Font:** Schibsted Grotesk (with system-ui, sans-serif fallback), loaded as `--font-display`
**Body Font:** Schibsted Grotesk
**Label/Mono Font:** Geist Mono (with ui-monospace, SF Mono, Menlo fallback), with tabular numerals

**Character:** A heavy, tightly tracked news grotesk carries every word, from the 88px HEAD title down to the footer links; weight and negative tracking do the work a second face would. Geist Mono is the instrument readout beside it, never a voice of its own.

### Hierarchy
- **Display** (800, `clamp(2.25rem, 6.2vw, 5.5rem)`, 0.98, -0.035em, balanced, max 16ch): the HEAD post's title only, an h2.
- **Footer Mark** (800, `clamp(2.25rem, 4vw, 3.25rem)`, 1, -0.04em): the NullByte mark that closes the log in the footer.
- **Headline** (750, `clamp(1.375rem, 2.3vw, 2rem)`, 1.12, -0.025em, balanced): log-row titles, h2.
- **Wordmark** (800, 1.5rem, -0.03em; 1.3125rem below 480px): the nav brand.
- **Lead** (400, `clamp(1.125rem, 1.6vw, 1.375rem)`, 1.45, max 60ch): the HEAD excerpt.
- **Action** (800, 1.25rem, -0.01em): the primary button label.
- **Repo line** (600, 1.0625rem, 1.4, ink secondary): the page's real SEO H1, set small as a repository description.
- **Body** (400, 1rem, 1.5, max 70ch): log-row excerpts and the footer tagline (max 44ch). Topic links take 0.875rem.
- **Nav link** (600, 1rem): nav and footer links.
- **Data** (Geist Mono 600, 0.9375rem, 1.9): the HEAD hash and stat line (reading time · words · code blocks · date).
- **Data small** (Geist Mono 600, 0.8125rem): log-row meta, and the counts and dates inside branch pills (0.75rem, 500 there).

Two control labels, the branch switcher's legend and the footer column headings, are set at 700, 0.8125rem, uppercase with 0.08em tracking in ink tertiary. That treatment belongs to those two labels only.

### Named Rules
**The Data Line Rule.** Geist Mono carries data: hashes, dates, counts and the units that belong to them. Titles, excerpts, nav, footer and topic links are always Schibsted Grotesk, even when they sit inside a mono line (topic links reset the family).

**The Small H1 Rule.** The SEO H1 stays the page's real H1, set small as the repository line. The visual focus is the HEAD title, an h2. Never promote the visual focus to h1 or drop the H1 to fix the hierarchy.

**The Class Selector Rule.** `globals.css` sets unlayered rules on `h1`–`h6`, `p` and `a` (size, weight, margin, line-height, colour, hover underline). Unlayered CSS outranks Tailwind's layered utilities, and `a:hover` outranks a single class. Style every element in this world through its own class selector, and expect to restate margin, line-height, colour and decoration that the globals would otherwise impose.

## Layout

A single centred wrap, max 1440px, with a fluid gutter (`clamp(16px, 3.5vw, 48px)`). The home is a two-column log: each row is a grid of a graph cell and a content cell. The graph column is computed from the lane geometry: lane origin `clamp(6px, 3vw, 48px)`, lane gap `clamp(12px, 3.2vw, 56px)`, rail width `clamp(8px, 1.3vw, 18px)`, node `clamp(18px, 3.4vw, 48px)`, plus a gutter `clamp(14px, 3vw, 44px)`. That gives roughly a quarter of the wrap on desktop, wide enough for all five lanes. Everything scales with the viewport through these clamps, so the graph stays proportional from phone widths up to the 1440px wrap.

Rhythm: the repository header opens at `clamp(28px, 5vw, 56px)`, the log starts `clamp(24px, 4vw, 44px)` below it, and each row is 18px over 26px between 2px ink rules. The HEAD row has no top rule and closes with `clamp(36px, 5vw, 64px)`. The page ends with `clamp(48px, 8vw, 112px)` before the footer.

Breakpoints:
- **Below 480px:** tighter nav gaps, smaller wordmark, narrower sign-in button.
- **Below 640px:** branch pills drop their last-post date and keep the count.
- **Below 768px:** the branch pill row stops wrapping and becomes a bleed-to-edge horizontal scroller with scroll-snap and a hidden scrollbar; the nav hides its Home link (the wordmark is home); the footer is one column.
- **768px and up:** the footer becomes a 2fr / 1fr / 1fr grid.

## Elevation & Depth

None. This world is flat: no `box-shadow`, no cards, no raised panels, no tonal surface tiers. Depth is replaced by sequence. Rails run behind nodes (nodes sit above the rails, with ground-coloured centres), and 2px ink rules separate the nav, each log row, the footer and the footer base.

### Named Rules
**The Flat Log Rule.** No cards, no shadows, no rounded panels. If content needs separating, use a 2px ink rule; if it needs grouping, put it on the log.

## Shapes

Hard horizontal rules and round instruments. Every rule and border is 2px solid ink: the nav underline, the row dividers, the footer rules, the branch-pill outline, the nav-link hover underline. Corners are reserved for small objects: branch pills are full capsules (999px), the HEAD chip is a 6px tag, the primary button an 8px slab, pill swatches 3px squares, topic marks 2px squares. Nodes are circles: the primary node is a ground-filled ring whose ink border is 19% of its diameter; secondary nodes are half-size filled lane dots with a 3px ink ring. Rails are straight vertical bars with half-round ends where they start (at each lane's newest row) and stop (at the root). Containers have no radius.

## Components

### Buttons
Heavy, inked and singular: one per page.
- **Shape:** an 8px-cornered slab, 56px tall, 26px side padding, label and arrow 12px apart.
- **Primary:** ink fill, ground text, Action type ("Read the latest" with a trailing arrow).
- **Hover / Focus:** hover swaps the fill to cobalt with on-accent text and slides the arrow 4px right (0.18s ease-out). Focus shows a 3px cobalt outline at 4px offset.

### Chips
- **Branch pill (filter):** a radio rendered as a 40px capsule with a 2px ink outline: lane swatch, branch name (700, 0.9375rem), then a mono count and last-post date (0.75rem). Hover fills it with pressed steel; checked inverts to an ink fill with ground text; keyboard focus draws a 3px cobalt outline at 3px offset on the label. "all" carries no swatch.
- **HEAD chip:** an ink tag with 6px corners, ground text (700, 0.8125rem), "HEAD → topic", set after the hash.
- **Topic link:** not a chip. 0.875rem grotesk in ink secondary, led by a 9px lane-coloured square; hover goes to ink with an underline.

### Navigation
- **Style:** a 64px bar on the ground with a 2px ink rule beneath. The wordmark sits left; Home and Posts links (600, ink secondary) follow and take ink plus a 2px ink underline on hover. Language switcher, theme toggle and sign-in sit right.
- **Mobile:** below 768px the Home link hides; below 480px gaps tighten and the wordmark shrinks.

### Footer
- **Style:** the log's close. A 2px ink rule on top, then the footer mark and tagline, a Quick Links column and a Connect column of brand icons. Links are 600 ink secondary and turn ink with an underline on hover. A second 2px rule sets off the copyright line (0.875rem, ink tertiary).

### Build Log (signature)
- **HEAD commit block:** the first log row. A mono ref line (hash, HEAD chip), the Display title linking to the post (underline on hover at 0.06em), the Lead excerpt, the mono stat line with separator dots glued to the item before them, then the primary button. The HEAD node is the tip of its rail.
- **Log row:** a 2px ink rule above, a Headline title link, a Body excerpt, then a mono meta line (hash, date, reading time) followed by the post's topic links. The node sits 34px down on the post's primary lane (the tag named in its title, else its least-used topic tag); its other lanes get filled dots.
- **Rails:** each lane's rail starts at the newest row on that lane and runs to the root row at the end of the log. They draw up from the root to HEAD once on load (scaleY from the bottom, 0.9s, `cubic-bezier(0.16, 1, 0.3, 1)`, staggered 55ms per row). Hovering a row widens its primary rail 1.45×.
- **Branch filter:** checking a branch hides the rows that are not on it, shows a "More in {branch} →" row when the branch has posts beyond the log, and dims every other lane's rails and nodes to 16% opacity. The log ends with an all-posts link or "Start of the log" with the date of the first post.

### Named Rules
**The Draw Once Rule.** Rails draw once, on load, from the root up to HEAD. Under `prefers-reduced-motion` they appear already drawn, and the rail, node, row, pill and button transitions are off.

**The CSS-First Filter Rule.** The branch filter is radio inputs read by `:has()` selectors and works without JavaScript. A client wrapper only adds a view transition (0.35s, same easing) where `startViewTransition` exists and reduced motion is off; otherwise the change snaps.

## Do's and Don'ts

### Do:
- **Do** read every colour from the `--bl-*` custom properties so the light and dark values switch together.
- **Do** separate content with 2px ink rules and let the rails carry the structure.
- **Do** name the topic in text next to every lane colour.
- **Do** keep Geist Mono to hashes, dates and counts, with tabular numerals.
- **Do** keep keyboard focus cobalt: the world remaps `--ring` to the accent, so links take the global 2px outline and the branch pill and primary button take a 3px outline.
- **Do** style world elements through their own class selectors, since the global element rules outrank utilities.
- **Do** honour reduced motion: no rail draw, no view transition, no rail, pill or button transitions.

### Don't:
- **Don't** add cards, shadows or rounded panels to this world.
- **Don't** add a fifth topic colour; fold extra topics into the "other" rail.
- **Don't** set titles, excerpts, navigation or topic names in monospace.
- **Don't** use neon, glows or a dark-terminal costume.
- **Don't** present the short hash as a real git commit or invent history the posts don't have.
- **Don't** use the cobalt accent as a resting button or link colour.
- **Don't** make the visual focus the H1; the SEO H1 stays the real H1, set small.

## Legacy world (being retired)

**Remove as each page migrates.** These pages still render in the previous system ("The Engineer's Notebook": warm paper, Geist, fuchsia tags, soft-shadowed cards): the article page `/posts/[slug]`, the posts index, tag and category pages, legal pages, auth pages, and admin/editor. The full description lives in git history (`DESIGN.md` at commit `c5dcd2a`). None of its tokens belong in the frontmatter above, and new surfaces must not use them.

The tokens those pages still rely on, defined in the upper part of `globals.css`:
- **Surfaces:** `--background`, `--background-secondary`, `--background-tertiary`, `--border`, `--input-background`, `--input-border`.
- **Text:** `--text-primary`, `--text-secondary`, `--text-tertiary`.
- **Accent:** `--primary`, `--primary-hover`, `--tag-background`, `--tag-background-hover`, `--tag-text`.
- **shadcn / editor:** `--card`, `--muted`, `--accent`, `--foreground`, `--ring`, `--brand`, `--highlight`.

The shared nav and footer bridge the two worlds: their chrome remaps the legacy surface, text, border, primary, accent and ring tokens onto the `--bl-*` values, so the legacy language switcher, theme toggle and auth menu render in Build Log colours without being rewritten. That remap is transitional. Delete it once those widgets are restyled on `--bl-*` directly.
