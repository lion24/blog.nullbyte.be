import { PrismaClient } from '@prisma/client'
import {
  createUser,
  createAdminUser,
  createPost,
  createTag,
  createCategory
} from './factories'

const prisma = new PrismaClient()

/**
 * Clean all data from the database
 */
export async function cleanDatabase() {
  const deleteOperations = [
    prisma.post.deleteMany(),
    prisma.category.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany()
  ]
  
  await Promise.all(deleteOperations)
}

/**
 * Create a test user with posts
 */
export async function createTestUserWithPosts(
  userData?: Parameters<typeof createUser>[0],
  numberOfPosts: number = 3
) {
  const user = await prisma.user.create({
    data: createUser(userData)
  })

  const posts = await Promise.all(
    Array.from({ length: numberOfPosts }).map((_, i) =>
      prisma.post.create({
        data: createPost(user.id, {
          title: `Test Post ${i + 1}`,
          slug: `test-post-${i + 1}`
        })
      })
    )
  )

  return { user, posts }
}

/**
 * Create a complete blog setup with users, categories, tags, and posts
 */
export async function createCompleteBlogSetup() {
  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: createCategory({ name: 'Tech', slug: 'tech' }) }),
    prisma.category.create({ data: createCategory({ name: 'News', slug: 'news' }) })
  ])

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: createTag({ name: 'JavaScript', slug: 'javascript' }) }),
    prisma.tag.create({ data: createTag({ name: 'TypeScript', slug: 'typescript' }) }),
    prisma.tag.create({ data: createTag({ name: 'React', slug: 'react' }) })
  ])

  // Create admin user
  const admin = await prisma.user.create({
    data: createAdminUser({
      name: 'Test Admin',
      email: 'test-admin@example.com'
    })
  })

  // Create regular user
  const regularUser = await prisma.user.create({
    data: createUser({
      name: 'Test User',
      email: 'test-user@example.com'
    })
  })

  // Create posts with relationships
  const adminPost = await prisma.post.create({
    data: {
      ...createPost(admin.id, {
        title: 'Admin Post',
        slug: 'admin-post',
        published: true
      }),
      categories: {
        connect: [{ id: categories[0].id }]
      },
      tags: {
        connect: [{ id: tags[0].id }, { id: tags[1].id }]
      }
    }
  })

  const userPost = await prisma.post.create({
    data: {
      ...createPost(regularUser.id, {
        title: 'User Post',
        slug: 'user-post',
        published: false
      }),
      categories: {
        connect: [{ id: categories[1].id }]
      },
      tags: {
        connect: [{ id: tags[2].id }]
      }
    }
  })

  return {
    users: { admin, regularUser },
    categories,
    tags,
    posts: { adminPost, userPost }
  }
}

/**
 * Reset database to a clean state
 */
export async function resetDatabase() {
  await cleanDatabase()
}

/**
 * Seed minimal test data
 */
export async function seedMinimalData() {
  await cleanDatabase()
  
  const user = await prisma.user.create({
    data: createUser({
      name: 'Test User',
      email: 'test@example.com'
    })
  })

  const tag = await prisma.tag.create({
    data: createTag({ name: 'Test Tag', slug: 'test-tag' })
  })

  const category = await prisma.category.create({
    data: createCategory({ name: 'Test Category', slug: 'test-category' })
  })

  const post = await prisma.post.create({
    data: {
      ...createPost(user.id, {
        title: 'Test Post',
        slug: 'test-post'
      }),
      tags: {
        connect: [{ id: tag.id }]
      },
      categories: {
        connect: [{ id: category.id }]
      }
    }
  })

  return { user, tag, category, post }
}

export { prisma }