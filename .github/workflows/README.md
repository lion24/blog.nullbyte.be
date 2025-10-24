# GitHub Workflows

This directory contains GitHub Actions workflows for CI/CD.

## Workflows

### `ci.yml` - CI/CD Pipeline

Runs on all pushes and pull requests to `dev`, `staging`, and `main` branches.

#### Jobs

1. **`ci/tests`** (Required for all branches)
   - Runs on: dev, staging, main
   - Steps:
     - Install dependencies
     - Setup PostgreSQL test database
     - Generate Prisma client
     - Run ESLint
     - Run TypeScript type checking
     - Run tests (when configured)

2. **`ci/build`** (Required for main branch only)
   - Runs on: main branch PRs and pushes only
   - Steps:
     - Install dependencies
     - Generate Prisma client
     - Build Next.js application
     - Verify build output

#### Branch Protection Alignment

- **dev**: Requires `ci/tests` status check
- **staging**: Requires `ci/tests` status check + 1 approval
- **main**: Requires `ci/tests` + `ci/build` status checks (strict) + 2 approvals

#### Environment Variables Required

The workflow uses placeholder values for CI builds. No secrets are required unless you want to:
- Upload coverage reports (requires `CODECOV_TOKEN`)

## Adding Tests

To add actual tests, update `package.json`:

```json
{
  "scripts": {
    "test": "jest --ci --coverage"
  }
}
```

And install Jest:

```bash
npm install --save-dev jest @types/jest ts-jest
```

## Deployment

Vercel handles deployments automatically:
- **Preview**: Automatic on every commit/PR
- **Production**: Automatic on main branch pushes

The CI workflow focuses only on quality checks (lint/test/build).
