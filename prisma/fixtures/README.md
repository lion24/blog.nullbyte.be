# Database Fixtures

This directory contains fixtures and factories for seeding the database with test data.

## Usage

### Running the seed script

```bash
# Seed the database with test data
npm run db:seed

# Seed with production environment
npm run db:seed:prod

# Reset database and seed (drops all data!)
npm run db:reset

# Open Prisma Studio to view data
npm run db:studio
```

### Using fixtures in tests

```typescript
import {
  cleanDatabase,
  createTestUserWithPosts,
  createCompleteBlogSetup,
  seedMinimalData,
  prisma
} from '../prisma/fixtures/test-helpers'

// Before each test
beforeEach(async () => {
  await cleanDatabase()
})

// After all tests
afterAll(async () => {
  await prisma.$disconnect()
})

// Example test
test('should create a user with posts', async () => {
  const { user, posts } = await createTestUserWithPosts(
    { name: 'John Doe', email: 'john@example.com' },
    5 // number of posts
  )
  
  expect(user.name).toBe('John Doe')
  expect(posts).toHaveLength(5)
})

// Example with complete setup
test('should have complete blog setup', async () => {
  const setup = await createCompleteBlogSetup()
  
  expect(setup.users.admin.role).toBe('ADMIN')
  expect(setup.users.regularUser.role).toBe('READER')
  expect(setup.categories).toHaveLength(2)
  expect(setup.tags).toHaveLength(3)
})
```

### Using factories directly

```typescript
import { createUser, createPost, createTag } from '../prisma/fixtures/factories'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Create a custom user
const userData = createUser({
  name: 'Custom User',
  email: 'custom@example.com'
})
const user = await prisma.user.create({ data: userData })

// Create a post for the user
const postData = createPost(user.id, {
  title: 'My Custom Post',
  slug: 'my-custom-post',
  published: false
})
const post = await prisma.post.create({ data: postData })
```

## Available Factories

### User Factory
- `createUser(overrides?)` - Creates a regular user with READER role
- `createAdminUser(overrides?)` - Creates an admin user with ADMIN role

### Post Factory
- `createPost(authorId, overrides?)` - Creates a post with random content

### Tag Factory
- `createTag(overrides?)` - Creates a tag with unique name and slug

### Category Factory
- `createCategory(overrides?)` - Creates a category with unique name and slug

## Test Helpers

### `cleanDatabase()`
Removes all data from the database.

### `createTestUserWithPosts(userData?, numberOfPosts?)`
Creates a user with a specified number of posts.

### `createCompleteBlogSetup()`
Creates a complete blog setup with:
- Admin and regular users
- Multiple categories
- Multiple tags
- Posts with relationships

### `seedMinimalData()`
Seeds minimal data for quick testing (1 user, 1 post, 1 tag, 1 category).

### `resetDatabase()`
Alias for `cleanDatabase()`.

## Default Data

The fixtures include predefined data sets:

### Default Tags
JavaScript, TypeScript, React, Next.js, Node.js, Database, PostgreSQL, Prisma, Testing, DevOps

### Default Categories
Tutorial, How-To, Best Practices, News, Opinion, Case Study

### Sample Post Contents
Three pre-written blog posts about Next.js, Prisma, and Node.js with full markdown content.

## Notes

- All factories generate unique data using timestamps and random numbers
- The seed script will clean the database before seeding (can be disabled)
- Factories support overrides for customization
- All generated users have avatar URLs from DiceBear API
- Posts are created with random view counts and dates