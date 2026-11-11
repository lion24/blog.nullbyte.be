---
version: 1
slug: "src-app-locale-main-page-tsx"
primary_target: "src/app/[locale]/(main)/page.tsx"
related_targets: ["src/components/Navigation.tsx","src/components/Footer.tsx"]
---

# Home page (`/[locale]`)

**Mode:** Persuade. **Scope:** home page body plus the shared nav and footer, EN + FR, desktop and mobile. First surface of a new visual world; other pages adopt it in later passes.

**Audience and job:** a developer mid-problem, often francophone/Belgian and open-source minded, landing from search or GitHub. Within ten seconds: start the latest post, trust that the work is hands-on, see which topics NullByte covers.

**Action:** "Read the latest" — a working link to the newest post, inside the first viewport.

**Proof/content:** only real data — post titles, excerpts, dates, reading time, word and code-block counts, tags. 1–3 real posts today; must hold at 0 and at 50+. The short hash is a display ID derived from the post id, never presented as a real git commit.

**Confirmed decisions:**
- The SEO H1 ("Welcome to NullByte — Tutorials & Engineering Insights" / FR) stays the real H1, set as a small repository-description line; the latest post's title is the visual focus as an h2.
- A branch (rail) is a topic = tag. The four busiest tags get their own rail and colour; all other tags fold into one "other" rail. Topics are always named in text, never by colour alone.
- Nav and footer are restyled in the new world now.
- The stock hero image is dropped.

**Anti-goals:** dark terminal costume, neon, monospace beyond hashes/dates/counts, card grids, the hero-over-cards template, fake git history.

**Open:** branch colours beyond four (folded into "other"); article, index and tag pages adopt the world later.

## Direction contract

THESIS: The home page is NullByte's build log — every post a commit in the history of something actually built, newest (HEAD) first. It refuses the blog template of a hero image over a row of equal cards.

OWN-WORLD: Pale steel ground by day, deep graphite by night; near-black ink. Four full-saturation topic rails — vermilion, cobalt, green, violet — at rail weight, owning their column top to bottom, plus a neutral "other" rail. Commit messages in a heavy, tightly tracked grotesk; monospace only for hashes, dates and counts. Thick ink-ring nodes, 2px ink rules between log rows; no cards, no shadows, no rounded panels.

STORY: The visitor reads what NullByte is from the repository line, sees the latest real build at headline scale with its real stats, and reads it. Scrolling, they walk the log backwards in time; switching branch shows one topic's history.

FIRST VIEWPORT: 64px nav on a 2px ink rule: wordmark, Home/Posts links, EN|FR, theme, sign-in (the nav is site-wide, so the branch switcher lives at the top of the page body instead: a row of topic pills, each with its colour, post count and last date). Left ~25%: the rails rising to the HEAD node. Right: the small SEO H1 line, hash + "HEAD → topic" label, the latest title at ~84px, excerpt at ~22px, a mono stat line (reading time · words · code blocks · date), and the ink "Read the latest →" button; the first older log rows begin at the fold.

FORM: The Build Log (git log --graph at poster scale), position 7 of the ordered list; seed:729566804ef618c1. Signature interaction: the branch switcher filters the log by topic — other rails and rows recede, the log re-flows (view transition where supported, a snap under reduced motion); hovering a row lights its rail. Motion grammar: the rails draw up from the root to HEAD once on load, damped.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
