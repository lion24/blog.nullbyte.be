---
version: 1
slug: "src-app-locale-main-posts-slug-page-tsx"
primary_target: "src/app/[locale]/(main)/posts/[slug]/page.tsx"
related_targets: ["src/components/ContentRenderer.tsx","src/lib/markdown.ts"]
---

# Article page (`/[locale]/posts/[slug]`)

**Mode:** Read. **Scope:** the production article page, EN + FR, desktop and mobile, light and dark, inside the established Build Log world (DESIGN.md unchanged).

**Audience and job:** a developer from search, GitHub or the home log — sometimes scanning for one section or code block to copy, sometimes following the whole build. Scanners find the right section in seconds; readers move comfortably and continue to the next post.

**Confirmed decisions:**
- Keep share buttons, view counter, featured image, breadcrumb and back link.
- Contents: auto-generated from h2/h3; sticky in the right margin on wide screens, collapsible at the top on mobile, marks the section in view. Label: "Sections" (EN and FR).
- Code blocks: language label + copy button with confirmation, keyboard-accessible.
- After the article: "more on this topic" plus older/newer post. Wording: "← Older post" / "Newer post →" (FR "Article précédent" / "Article suivant").
- Featured image: full reading-column width, after the header, before §01.

**Ranges/states:** 1–2 sections (no index) to 10+ with h3s; with/without featured image, excerpt, code; first/last post (one neighbour); topic with no other posts; long FR titles and headings.

**Anti-goals:** hunk notation beyond one small numbering line; +/- diff colours in prose; world devices replacing the reading order or navigation; a performing reading column.

## Direction contract

THESIS: The article is the change set of one build — a commit header, then sections that open as numbered hunks. It refuses the generic blog article: a big image, a centred title, and one endless column with no way to jump.

OWN-WORLD: The Build Log as recorded in DESIGN.md: pale steel / graphite ground, near-black ink, the post's topic colour only as a swatch or rule, Schibsted Grotesk headings and reading text, Geist Mono for hunk lines and data, 2px ink rules, no cards or shadows; Shiki's dark code blocks under an ink toolbar.

STORY: The reader takes in the commit header (what, when, how long, how much code), jumps by the numbered Sections index or scans the hunk lines, copies code, reads on, then continues to more on the same topic or the older/newer post.

FIRST VIEWPORT: Nav; breadcrumb Home / Posts / topic; commit line (topic swatch, hash, topic chip, date · reading time · words · code blocks · views); the title at ~64px (≤17ch); the excerpt as a ~22px lead; author and share on a 2px ink rule; the first hunk line and h2 at the fold — or, when the post has a featured image, the opening figure (2:1, full column width) at the fold with §01 directly after it. Right margin: the sticky "Sections" index, numbered 01–n, the section in view in full ink weight.

FORM: Hunk sections, position 5 of 5 on the ordered structure list; seed:04bc0c3e1ef2def5. Signature: the numbered mono hunk line (`@@ 01 / 04 · 3 code blocks @@`) above each h2, mirrored by the margin index that tracks the section in view; every code block carries its language and a copy button.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
