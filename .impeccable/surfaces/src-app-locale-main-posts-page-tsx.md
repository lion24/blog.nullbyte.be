---
version: 1
slug: "src-app-locale-main-posts-page-tsx"
primary_target: "src/app/[locale]/(main)/posts/page.tsx"
related_targets: ["src/app/[locale]/(main)/tags/[slug]/page.tsx","src/app/[locale]/(main)/categories/[slug]/page.tsx","src/components/BuildLog.tsx"]
---

# Posts index, tag and category pages

Scope: `/[locale]/posts`, `/[locale]/tags/[slug]`, `/[locale]/categories/[slug]`. Mode: Read (wayfinding: the reader finds the next post by time or topic). World: The Build Log (DESIGN.md), unchanged.

Audience and job: a developer who finished a post, or landed from search, and wants more of the same topic or the whole history. Content is real posts only; no invented counts or history.

Decisions (user, 2026-11-11): posts index = "Full log"; tag page = "Branch view"; category page = "Same log, neutral head". No concept roll was run: the structures were offered and chosen directly with the user, so the roll was skipped.

## Direction contract
THESIS: these pages are the home log continued, not a card grid: every post is a commit row on its topic rails. They refuse the equal-card archive grid.
OWN-WORLD: pale steel / graphite ground, ink, 2px ink rules, four lane rails plus "other", Schibsted Grotesk titles, Geist Mono data line only. No cards, no shadows.
STORY: the reader sees the whole history or one branch of it, recognises topics by named colour, and opens a post or switches branch.
FIRST VIEWPORT: index: small repo-line H1 "All Posts" with mono count, the branch pills, then log rows with Headline titles from the top. Tag: mono crumb, the tag name as H1 at Article title scale led by its lane square, mono stat line (count · first → latest), then the log with only that lane's rail. Category: same without a swatch, posts on their own rails.
FORM: one shared BuildLog graph; branch filter pure CSS on the index; branch view = single rail plus dots. seed: none (roll skipped; structure chosen by the user).
FINISH: rails draw once; reduced motion honoured; ends with "Start of the log/branch" and date; no overflow at 390px; EN/FR parity.
