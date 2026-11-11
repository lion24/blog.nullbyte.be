# GitHub Workflows

## `ci.yml` — CI

Runs on pushes to `main` and pull requests targeting `main`.

### Jobs

- **`ci/tests`** — Lint, type-check, and run the Jest suite against a PostgreSQL service container.
- **`ci/build`** — Generate the Prisma client and run `npm run build` to verify the Next.js production build.
- **`ci/design-detector`** — Run the [Impeccable design detector](https://impeccable.style/docs/detector/) (`npx impeccable@4 detect --json src`) and upload its findings as a build artifact. Scored against the committed `.impeccable/config.json` and `DESIGN.md`. Fails the job on exit code `1` (a target could not be scanned) or `2` (primary findings); exit `0` means clean, though advisories may still be listed in the uploaded JSON.
  - A legitimate new design-system exception goes in `.impeccable/config.json`'s `detector.ignoreValues` (see the existing entries for the pattern), not in a CI-only suppression.
  - On a pull request, findings are also posted as inline review comments via [reviewdog](https://github.com/reviewdog/reviewdog), converted from the detector's JSON by `.github/scripts/impeccable-to-rdjson.mjs`. reviewdog's default filter only comments on lines the PR's diff touches; a finding elsewhere still appears in the uploaded JSON. If comments stop appearing, check Settings → Actions → General → Workflow permissions (the job requests `pull-requests: write` itself, but an org policy can still cap it).

`ci/tests` and `ci/build` are required by branch protection on `main`. `ci/design-detector` is not yet required — add it in the repo's branch protection settings once you're ready to block merges on it.

### Deployments

Deployments are handled by Vercel's native Git integration:

- **Pull requests**: Vercel posts a preview URL as a check.
- **Push to `main`**: Vercel deploys to production automatically.

CI does not deploy. Branch protection on `main` ensures only PRs that pass `ci/tests` and `ci/build` can merge, so production never receives an untested commit.
