# Vercel Integration Setup

This project uses GitHub Actions to control Vercel deployments, ensuring deployments only happen after CI passes.

## How It Works

1. **CI Pipeline runs first** (`ci/tests` + `ci/build`)
2. **Deployment blocked** until all checks pass
3. **Vercel deploys** only after successful CI

## Setup Instructions

### 1. Get Vercel Tokens

Run these commands locally:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
cd /path/to/your/project
vercel link

# Get your tokens
vercel --version  # Make sure you're logged in
```

Then get your credentials:

```bash
# Get Vercel Token
# Go to: https://vercel.com/account/tokens
# Create a new token with name "GitHub Actions"
# Copy the token

# Get Project ID and Org ID
cat .vercel/project.json
```

You'll see output like:
```json
{
  "projectId": "prj_xxxxxxxxxxxxx",
  "orgId": "team_xxxxxxxxxxxxx"
}
```

### 2. Add GitHub Secrets

Go to your GitHub repository:

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these 3 secrets:

| Name | Value | Where to find |
|------|-------|---------------|
| `VERCEL_TOKEN` | `your_vercel_token` | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | `team_xxxxx` or `user_xxxxx` | `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | `prj_xxxxx` | `.vercel/project.json` → `projectId` |

### 3. Disable Automatic Vercel Deployments

The `vercel.json` file in this repo already disables automatic deployments:

```json
{
  "git": {
    "deploymentEnabled": {
      "main": false,
      "staging": false,
      "dev": false
    }
  }
}
```

**Commit and push this file** to apply the changes.

### 4. Verify Setup

After setting up:

1. Push a commit to `dev` branch
2. Watch GitHub Actions run CI
3. After CI passes, Vercel deployment starts
4. Check Vercel dashboard for the new deployment

## Deployment Flow

### Dev Branch
```
Push to dev → CI runs → Tests pass → Deploy to Vercel (preview)
```

### Staging Branch
```
PR to staging → CI runs → Tests pass → Merge → Deploy to Vercel (preview)
```

### Main Branch (Production)
```
PR to main → CI runs → Tests + Build pass → 2 Approvals → Merge → Deploy to Vercel (production)
```

## Troubleshooting

### Deployment Not Triggering

1. Check GitHub Actions logs
2. Verify secrets are set correctly
3. Make sure `vercel.json` is committed
4. Check Vercel dashboard for deployment errors

### CI Passes But No Deployment

Check if the workflow ran on a **push** event (not pull_request).
Deployments only trigger on `push` to branches.

### Vercel Still Auto-Deploying

1. Ensure `vercel.json` is committed to all branches
2. Wait a few minutes for Vercel to pick up the changes
3. Try removing the Vercel integration in GitHub and re-adding it

## Manual Deployment (Emergency)

If you need to deploy manually bypassing CI:

```bash
# Production
vercel --prod

# Preview
vercel
```

## Removing This Setup

To go back to automatic Vercel deployments:

1. Delete or modify `vercel.json`
2. Remove the `deploy` job from `.github/workflows/ci.yml`
3. Re-enable automatic deployments in Vercel dashboard
