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
     - Run tests

2. **`ci/build`** (Required for all branches)
   - Runs on: dev, staging, main (all branches that deploy)
   - Steps:
     - Install dependencies
     - Generate Prisma client
     - Build Next.js application
     - Verify build output
   - **Why for all branches?** Ensures preview deployments don't fail due to build errors

#### Branch Protection Alignment

- **dev**: Requires `ci/tests` + `ci/build` status checks
- **staging**: Requires `ci/tests` + `ci/build` status checks + 1 approval
- **main**: Requires `ci/tests` + `ci/build` status checks (strict mode) + 2 approvals

**Note:** All branches run both tests and build to ensure preview deployments succeed.

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

Deployments are triggered by the CI/CD pipeline (GitHub Actions) after all required checks pass:
- **Preview**: Triggered by the workflow on every commit/PR to dev, staging, or main
- **Production**: Triggered by the workflow on main branch pushes after checks and approvals

Automatic deployments by Vercel are disabled in `vercel.json`; all deployments are managed by the workflow.
