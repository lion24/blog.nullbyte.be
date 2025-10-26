# Contributing to NullByte Tech Blog

Thank you for your interest in contributing! This document provides guidelines and workflows for contributing to this project.

## Table of Contents

- [Getting Started](#getting-started)
- [Workflow Strategy](#workflow-strategy)
- [Development Setup](#development-setup)
- [Database Migrations](#database-migrations)
- [Code Quality Standards](#code-quality-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Deployment Pipeline](#deployment-pipeline)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- GitHub account for OAuth authentication
- Git for version control

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/blog.nullbyte.be.git
   cd blog.nullbyte.be
   ```

3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/lion24/blog.nullbyte.be.git
   ```

## Workflow Strategy

This project follows a three-branch strategy:

```
dev (development) -> staging (pre-production) -> main (production)
```

### Branch Descriptions

- **`dev`**: Development branch for active feature work
  - All feature branches are created from `dev`
  - Merge feature branches back to `dev` when complete
  - Deployed to development environment
  - Less stable, frequent changes

- **`staging`**: Pre-production testing branch
  - Merge `dev` into `staging` when features are ready for testing
  - Used for QA, integration testing, and final review
  - Deployed to staging environment (Vercel preview)
  - Should be stable and production-ready

- **`main`**: Production branch
  - Only merge `staging` into `main` after thorough testing
  - Automatically deployed to production (blog.nullbyte.be)
  - Must always be stable and working
  - Protected branch with required reviews

### Workflow Steps

1. **Create a feature branch from `dev`:**
   ```bash
   git checkout dev
   git pull upstream dev
   git checkout -b feature/your-feature-name
   ```

2. **Develop your feature:**
   - Write code following our [code quality standards](#code-quality-standards)
   - Write tests for new functionality
   - Ensure all tests pass locally

3. **Push and create a Pull Request to `dev`:**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Open a PR against the `dev` branch
   - Fill out the PR template completely
   - Request review from maintainers

4. **After PR is merged to `dev`:**
   - Maintainers will test in the development environment
   - When ready, `dev` is merged into `staging` for final testing

5. **Staging to Production:**
   - After thorough testing in staging, `staging` is merged into `main`
   - This triggers automatic deployment to production

### Branch Protection Rules

- **`main`**: Requires PR approval, passing CI/CD, and no direct pushes
- **`staging`**: Requires passing CI/CD
- **`dev`**: Open for direct pushes from maintainers, but PRs encouraged

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Fill in the required environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/blog_dev"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Optional
OPENAI_API_KEY="your-openai-api-key"
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

### 3. Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Seed the database with sample data
npm run db:seed

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Database Migrations

### Creating Migrations

**CRITICAL**: Always use proper migrations. Never use `db push` for changes going to production.

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# This will:
# 1. Generate SQL migration files in prisma/migrations/
# 2. Apply the migration to your development database
# 3. Regenerate Prisma Client
```

### Migration Best Practices

1. **Always create migrations for schema changes**
   ```bash
   # ✅ CORRECT
   npx prisma migrate dev --name add_post_indexes

   # ❌ WRONG (only for prototyping)
   npx prisma db push
   ```

2. **Review generated SQL before committing**
   - Check `prisma/migrations/[timestamp]_[name]/migration.sql`
   - Ensure the migration does what you expect
   - Consider adding custom SQL if needed

3. **Test migrations thoroughly**
   ```bash
   # Reset database and reapply all migrations
   npm run db:reset

   # Verify data integrity
   npm run db:studio
   ```

4. **Deploy migrations to production**
   ```bash
   # In production environment (Vercel runs this automatically)
   npx prisma migrate deploy
   ```

### Common Migration Patterns

**Adding an index:**
```typescript
// schema.prisma
model Post {
  // ... fields
  @@index([published, createdAt])
}
```

**Atomic operations:**
```typescript
// ✅ CORRECT - Use atomic increment
await prisma.post.update({
  where: { id },
  data: { views: { increment: 1 } }
})

// ❌ WRONG - Race condition
await prisma.post.update({
  where: { id },
  data: { views: post.views + 1 }
})
```

## Code Quality Standards

### TypeScript

- Use strict TypeScript (no `any` types)
- Define proper types and interfaces
- Export types for reuse across files

```typescript
// ✅ GOOD
type Post = {
  id: string
  title: string
  readingTime: number
}

// ❌ BAD
function processPost(post: any) { ... }
```

### Code Style

- Run linter before committing:
  ```bash
  npm run lint
  ```

- Follow existing code patterns
- Use meaningful variable and function names
- Add comments for complex logic

### Performance

- Use Prisma `select` to fetch only needed fields
- Add database indexes for frequently queried fields
- Use non-blocking operations for non-critical updates
- Optimize images with Next.js Image component

### SEO

- Include comprehensive metadata for all pages
- Add JSON-LD structured data for articles
- Include Open Graph and Twitter Card metadata
- Generate dynamic sitemaps

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

- Place test files next to source files: `component.test.tsx`
- Test both happy paths and error cases
- Mock external dependencies (database, APIs)
- Use React Testing Library for component tests

Example:

```typescript
import { render, screen } from '@testing-library/react'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## Pull Request Process

### Before Creating a PR

1. **Ensure your branch is up to date:**
   ```bash
   git checkout dev
   git pull upstream dev
   git checkout your-feature-branch
   git rebase dev
   ```

2. **Run all checks locally:**
   ```bash
   npm run lint        # Check code style
   npm test            # Run tests
   npm run build       # Ensure build succeeds
   ```

3. **Review your changes:**
   ```bash
   git diff dev
   ```

### PR Requirements

Your PR must:

- [ ] Target the `dev` branch (not `main` or `staging`)
- [ ] Pass all CI/CD checks (lint, test, build)
- [ ] Include a clear description of changes
- [ ] Reference any related issues
- [ ] Include tests for new functionality
- [ ] Update documentation if needed
- [ ] Have meaningful commit messages

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of what this PR does and why.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested? What test cases did you add?

## Checklist
- [ ] My code follows the project's code style
- [ ] I have added tests that prove my fix/feature works
- [ ] All tests pass locally
- [ ] I have updated the documentation
- [ ] Database migrations are included (if applicable)

## Screenshots (if applicable)
Add screenshots or GIFs for UI changes.

## Additional Notes
Any additional information reviewers should know.
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Code Review**: At least one maintainer reviews your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, a maintainer will merge

## Deployment Pipeline

### Automatic Deployments

Our CI/CD pipeline automatically handles deployments:

```mermaid
graph LR
    A[Push to dev] --> B[Run Tests]
    B --> C[Deploy to Dev Environment]
    D[Merge to staging] --> E[Run Tests]
    E --> F[Deploy to Staging]
    G[Merge to main] --> H[Run Tests]
    H --> I[Deploy to Production]
```

### Environments

| Environment | Branch | URL | Purpose |
|------------|--------|-----|---------|
| Development | `dev` | dev.nullbyte.be* | Active development |
| Staging | `staging` | staging.nullbyte.be* | Pre-production testing |
| Production | `main` | blog.nullbyte.be | Live site |

*Note: Vercel preview URLs are used for dev and staging

### Deployment Steps

1. **Development**: Push to `dev` branch
   - Runs automated tests
   - Deploys to development environment
   - Preview URL available in PR comments

2. **Staging**: Merge `dev` into `staging`
   - Runs full test suite
   - Deploys to staging environment
   - QA and final testing

3. **Production**: Merge `staging` into `main`
   - Requires approval
   - Runs production build
   - Runs database migrations
   - Deploys to production
   - Creates GitHub release

### Rollback Strategy

If issues are found in production:

1. Revert the problematic PR in `main`
2. Deploy the revert to production immediately
3. Fix the issue in a new branch from `dev`
4. Follow the normal workflow: dev -> staging -> main

## Common Issues

### Database Connection Errors

- Ensure PostgreSQL is running locally
- Check `DATABASE_URL` in `.env`
- Run `npx prisma generate` after schema changes

### Build Failures

- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npx tsc --noEmit`

### Migration Conflicts

- Never modify existing migrations
- If you have conflicts, create a new migration to fix them
- In development, you can reset: `npm run db:reset`

### Authentication Issues

- Verify GitHub OAuth credentials
- Check `NEXTAUTH_URL` matches your current URL
- Regenerate `NEXTAUTH_SECRET` if needed

## Getting Help

- **Documentation**: Check `CLAUDE.md` for project architecture
- **Issues**: Search existing GitHub issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Ask for clarification in PR comments

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the project's coding standards

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to NullByte Tech Blog!** 🎉
