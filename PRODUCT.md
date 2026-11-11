# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience: developers searching for practical tutorials and engineering insights, arriving via search or the author's GitHub profile. They read a post end-to-end, then may browse related content by tag or category. A secondary, smaller audience follows the author's own development journey more personally, but the blog is written and structured for the first group.

## Product Purpose

NullByte is Lionel's personal technical blog: bilingual (EN/FR) tutorials and engineering write-ups, published and managed through a custom Next.js admin dashboard. Success is a reader finding a concrete, reproducible answer to a real engineering problem, and discovering more of the author's work from there (SEO-driven discovery, not paid acquisition).

## Positioning

Hands-on, from-the-trenches depth: posts document real implementation detail from the author's own projects (including this blog's own build — its Next.js/React upgrades, i18n work, admin tooling, SEO fixes), not surface-level explainers. That is the differentiator from a generic/generalist dev blog.

## Operating Context

- Public content is server-rendered directly from the database (no public read API); admin management runs through a private, authenticated API.
- Content is authored through an in-app rich text editor (Plate.js) with AI-assisted writing (OpenAI-backed copilot/commands).
- Posts are organized by Tags and Categories; admin manages Posts, Users, and Service Accounts (bearer-token access for external tools like n8n/CI scripts) from a dashboard.
- Auth is via NextAuth (GitHub OAuth, plus email/password with forgot/reset-password flows).
- Every public page ships in English and French via next-intl (`/[locale]/...` routing); content and UI copy are expected in both.

## Capabilities and Constraints

- Bilingual EN/FR is a durable constraint: new user-facing surfaces and copy must support both locales, not just English.
- SEO is an active, ongoing concern: sitemap, robots.txt, structured indexing, and a content-led (no paid link-building) growth strategy are established practice to preserve.
- No other binding accessibility standard or specific user accessibility need has been confirmed yet; general web accessibility practice applies by default.

## Brand Commitments

- Name: NullByte. Tagline (bilingual): "Tutorials & Engineering Insights" / "Tutoriels et génie logiciel".
- Existing logo asset at `public/logo.png`; hero image at `public/hero.jpg`.

## Evidence on Hand

- Live, running codebase with an incumbent visual implementation (Tailwind-based, light/dark themes already defined) — treated as current design authority per `impeccable context`; no DESIGN.md exists yet.
- No testimonials, case studies, press, or third-party proof assets on hand — future work must not fabricate these.

## Product Principles

1. Depth over breadth: every post should teach something the author actually did, not a repackaged explainer.
2. Bilingual by default: EN/FR parity is a baseline requirement, not an afterthought.
3. Organic discovery first: SEO and content quality drive growth; no paid or manipulative link tactics.
4. Server-rendered public surface, private authenticated admin: keep the two-tier architecture intact when extending functionality.
5. Reproducibility: tutorials should be concrete and actionable, not abstract.
