import { PrismaClient } from '@prisma/client'
import {
  createUser,
  createAdminUser,
  createPost,
  defaultTags,
  defaultCategories,
  samplePostContents
} from './fixtures/factories'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean database (optional - comment out if you want to keep existing data)
  console.log('🧹 Cleaning database...')
  await prisma.post.deleteMany()
  await prisma.category.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // Create tags
  console.log('🏷️  Creating tags...')
  const tags = await Promise.all(
    defaultTags.map(tag =>
      prisma.tag.create({ data: tag })
    )
  )

  // Create categories
  console.log('📁 Creating categories...')
  const categories = await Promise.all(
    defaultCategories.map(category =>
      prisma.category.create({ data: category })
    )
  )

  // Create admin user
  console.log('👤 Creating admin user...')
  const adminUser = await prisma.user.create({
    data: createAdminUser({
      name: 'Admin User',
      email: 'admin@example.com'
    })
  })

  // Create regular users
  console.log('👥 Creating regular users...')
  const regularUsers = await Promise.all([
    prisma.user.create({
      data: createUser({
        name: 'John Doe',
        email: 'john.doe@example.com'
      })
    }),
    prisma.user.create({
      data: createUser({
        name: 'Jane Smith',
        email: 'jane.smith@example.com'
      })
    }),
    prisma.user.create({
      data: createUser({
        name: 'Bob Wilson',
        email: 'bob.wilson@example.com'
      })
    })
  ])

  const allUsers = [adminUser, ...regularUsers]

  // Create posts with relationships
  console.log('📝 Creating posts...')
  for (let i = 0; i < samplePostContents.length; i++) {
    const author = allUsers[i % allUsers.length]
    const postContent = samplePostContents[i]
    
    // Select random tags and categories for each post
    const randomTags = tags
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 1)
    
    const randomCategories = categories
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 2) + 1)

    await prisma.post.create({
      data: {
        title: postContent.title,
        slug: postContent.title.toLowerCase().replace(/\s+/g, '-'),
        content: postContent.content,
        excerpt: postContent.excerpt,
        published: true,
        authorId: author.id,
        views: Math.floor(Math.random() * 500),
        tags: {
          connect: randomTags.map(tag => ({ id: tag.id }))
        },
        categories: {
          connect: randomCategories.map(cat => ({ id: cat.id }))
        }
      }
    })
  }

  // Create draft posts
  console.log('📄 Creating draft posts...')
  for (let i = 0; i < 5; i++) {
    const author = allUsers[Math.floor(Math.random() * allUsers.length)]
    
    await prisma.post.create({
      data: createPost(author.id, {
        title: `Draft Post ${i + 1}`,
        slug: `draft-post-${i + 1}`,
        published: false,
        excerpt: 'This is a draft post that is not yet published.'
      })
    })
  }

  // Create additional published posts for variety
  console.log('📚 Creating additional posts...')
  for (let i = 0; i < 10; i++) {
    const author = allUsers[Math.floor(Math.random() * allUsers.length)]
    const randomTags = tags
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 4) + 1)
    
    const randomCategories = categories
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 2) + 1)

    await prisma.post.create({
      data: {
        ...createPost(author.id, {
          title: `Blog Post ${i + 1}: ${['Tips', 'Guide', 'Tutorial', 'Review'][i % 4]}`,
          slug: `blog-post-${i + 1}`,
          createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000) // Random date within last 60 days
        }),
        tags: {
          connect: randomTags.map(tag => ({ id: tag.id }))
        },
        categories: {
          connect: randomCategories.map(cat => ({ id: cat.id }))
        }
      }
    })
  }

  // Print summary
  const userCount = await prisma.user.count()
  const postCount = await prisma.post.count()
  const publishedCount = await prisma.post.count({ where: { published: true } })
  const tagCount = await prisma.tag.count()
  const categoryCount = await prisma.category.count()

  console.log('\n✅ Seeding completed successfully!')
  console.log('📊 Database statistics:')
  console.log(`   - Users: ${userCount}`)
  console.log(`   - Posts: ${postCount} (${publishedCount} published)`)
  console.log(`   - Tags: ${tagCount}`)
  console.log(`   - Categories: ${categoryCount}`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })