# GitHub Workflows

## `ci.yml` — CI

Runs on pushes to `main` and pull requests targeting `main`.

### Jobs

- **`ci/tests`** — Lint, type-check, and run the Jest suite against a PostgreSQL service container.
- **`ci/build`** — Generate the Prisma client and run `npm run build` to verify the Next.js production build.

Both checks are required by branch protection on `main`.

### Deployments

Deployments are handled by Vercel's native Git integration:

- **Pull requests**: Vercel posts a preview URL as a check.
- **Push to `main`**: Vercel deploys to production automatically.

CI does not deploy. Branch protection on `main` ensures only PRs that pass `ci/tests` and `ci/build` can merge, so production never receives an untested commit.
