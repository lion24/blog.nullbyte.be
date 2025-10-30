# Tech Blog

A modern, full-featured blog built with Next.js, TypeScript, Prisma, PostgreSQL, and NextAuth.js for GitHub authentication.

## Features

- 📝 Write and publish blog posts with Markdown support
- 🔐 GitHub OAuth authentication
- 🎨 Clean, responsive design with Tailwind CSS
- 📊 View tracking for posts
- 🏷️ Categories and tags for organization
- 👤 Admin dashboard for managing posts
- 🚀 Optimized for Vercel deployment

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- GitHub OAuth App credentials

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/techblog?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### 3. Create GitHub OAuth App

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - Application name: "Tech Blog"
   - Homepage URL: "http://localhost:3000" (or your production URL)
   - Authorization callback URL: "http://localhost:3000/api/auth/callback/github"
4. Copy the Client ID and Client Secret to your `.env` file

### 4. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your blog!

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - Add all variables from your `.env` file
   - Update `NEXTAUTH_URL` to your production URL

### 3. Set Up Production Database

You can use:
- [Supabase](https://supabase.com) (recommended)
- [PlanetScale](https://planetscale.com)
- [Neon](https://neon.tech)
- Any PostgreSQL provider

### 4. Deploy

Click "Deploy" and Vercel will build and deploy your blog!

## Usage

### Creating Posts

1. Sign in with your GitHub account
2. Go to `/admin`
3. Click "New Post"
4. Write your post using Markdown
5. Add categories and tags
6. Publish!

### Post Management

- View all posts in the admin dashboard
- Edit existing posts
- Toggle between draft and published states
- Track view counts

## Project Structure

```
tech-blog/
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── admin/        # Admin pages
│   │   ├── posts/        # Blog post pages
│   │   └── layout.tsx    # Root layout
│   ├── components/       # Reusable components
│   ├── lib/             # Utilities
│   ├── i18n/            # Internationalization
│   └── types/           # TypeScript types
├── messages/            # Translation files (i18n)
├── prisma/
│   └── schema.prisma    # Database schema
├── docs/                # Project documentation
└── public/              # Static assets
```

## Documentation

For detailed documentation, see the [`docs/`](./docs) directory:

- 🌍 **[i18n Quick Start](./docs/I18N_QUICKSTART.md)** - Strongly typed translation system
- 💡 **[Translation Examples](./docs/TRANSLATION_EXAMPLES.md)** - Code examples for i18n
- 🤖 **[AI Features](./docs/AI_FEATURES.md)** - AI-powered editor capabilities
- 🏗️ **[Architecture Guide](./CLAUDE.md)** - Complete technical documentation

## Contributing

Feel free to open issues or submit pull requests! See our [contributing guidelines](./CONTRIBUTING.md) for more details.

## License

MIT
