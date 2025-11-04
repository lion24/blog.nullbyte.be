#!/usr/bin/env node

/**
 * Example script demonstrating service account usage
 * 
 * Usage:
 *   export SERVICE_ACCOUNT_TOKEN="sa_your_token_here"
 *   node examples/service-account-example.js
 */

const BLOG_API = process.env.BLOG_API || 'http://localhost:3000/api/admin'
const TOKEN = process.env.SERVICE_ACCOUNT_TOKEN

if (!TOKEN) {
  console.error('❌ Error: SERVICE_ACCOUNT_TOKEN environment variable not set')
  console.error('')
  console.error('Usage:')
  console.error('  export SERVICE_ACCOUNT_TOKEN="sa_your_token_here"')
  console.error('  node examples/service-account-example.js')
  process.exit(1)
}

async function fetchAPI(endpoint, options = {}) {
  const url = `${BLOG_API}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API error ${response.status}: ${error}`)
  }
  
  return response.json()
}

async function main() {
  console.log('🔐 Service Account API Example')
  console.log('=' .repeat(50))
  console.log('')
  
  try {
    // 1. List all posts
    console.log('📝 Fetching posts...')
    const { posts } = await fetchAPI('/posts')
    console.log(`✅ Found ${posts.length} posts`)
    
    if (posts.length > 0) {
      const firstPost = posts[0]
      console.log(`   Example: "${firstPost.title}" (${firstPost.slug})`)
    }
    console.log('')
    
    // 2. Get specific post details
    if (posts.length > 0) {
      const slug = posts[0].slug
      console.log(`📖 Fetching post details: ${slug}`)
      const { post } = await fetchAPI(`/posts/${slug}`)
      console.log(`✅ Post: "${post.title}"`)
      console.log(`   Author: ${post.author.name}`)
      console.log(`   Published: ${post.published ? 'Yes' : 'No'}`)
      console.log(`   Views: ${post.views}`)
      console.log('')
    }
    
    // 3. List all tags
    console.log('🏷️  Fetching tags...')
    const { tags } = await fetchAPI('/tags')
    console.log(`✅ Found ${tags.length} tags`)
    
    if (tags.length > 0) {
      const tagNames = tags.slice(0, 5).map(t => t.name).join(', ')
      console.log(`   Examples: ${tagNames}${tags.length > 5 ? '...' : ''}`)
    }
    console.log('')
    
    // 4. Check service account info
    console.log('🔑 Service Account Information')
    console.log('   Token is valid and working!')
    console.log('   Authenticated successfully')
    console.log('')
    
    console.log('✨ All operations completed successfully!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    
    if (error.message.includes('401')) {
      console.error('')
      console.error('💡 Troubleshooting:')
      console.error('   - Check that your token starts with "sa_"')
      console.error('   - Verify the token hasn\'t been revoked')
      console.error('   - Confirm the token is exactly 67 characters')
    } else if (error.message.includes('403')) {
      console.error('')
      console.error('💡 Troubleshooting:')
      console.error('   - Your token is valid but lacks required scopes')
      console.error('   - Contact admin to update your service account scopes')
    }
    
    process.exit(1)
  }
}

main()
