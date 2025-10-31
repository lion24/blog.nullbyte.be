# Post Creation Fix: Slug Uniqueness and Tag/Category Matching

## Problem

When creating a new post in the admin interface, the application was failing with a unique constraint error:

```
Unique constraint failed on the fields: (`slug`)
```

This occurred due to **two separate issues**:

### Issue 1: Post Slug Uniqueness
The slug generation logic was too simple - it converted the title to a URL-friendly format but didn't check for uniqueness. If two posts had the same or similar titles, they would generate the same slug, causing a unique constraint violation.

### Issue 2: Tag/Category Case-Sensitivity (Root Cause)
The `connectOrCreate` logic was using `where: { name: tag }` which is **case-sensitive**. When trying to create a post with tag "testing" (lowercase), but a tag "Testing" (capital T) already existed with slug "testing", the system would:
1. Not find "testing" by name (because "Testing" ≠ "testing")
2. Try to create a new tag with slug "testing"
3. Fail because slug "testing" already exists

**Example:**
- Existing tag: `{ name: "Testing", slug: "testing" }`
- User enters: `tags: "testing"`
- System tries to create: `{ name: "testing", slug: "testing" }` ← **Unique constraint violation on slug!**

## Solution

### 1. Created a Slug Utility Library (`src/lib/slug.ts`)

**Functions:**
- `slugify(text: string)`: Converts text to URL-friendly slug format (lowercase, alphanumeric + hyphens)
- `generateUniqueSlug(title: string, excludeId?: string)`: Generates a unique slug by:
  - Creating a base slug from the title
  - Checking if it exists in the database
  - Appending a number (`-1`, `-2`, etc.) until a unique slug is found
  - Optionally excluding a specific post ID (useful for updates)

### 2. Fixed Tag/Category Lookup (Critical Fix)

Changed `connectOrCreate` to use **slug-based lookup** instead of name-based:

**Before (case-sensitive, caused errors):**
```typescript
tags: {
  connectOrCreate: tags?.map((tag: string) => ({
    where: { name: tag },  // ❌ Case-sensitive!
    create: { name: tag, slug: slugify(tag) }
  }))
}
```

**After (case-insensitive, works correctly):**
```typescript
tags: {
  connectOrCreate: tags?.map((tag: string) => ({
    where: { slug: slugify(tag) },  // ✅ Case-insensitive!
    create: { name: tag, slug: slugify(tag) }
  }))
}
```

This ensures that:
- "testing", "Testing", "TESTING" all match the same tag
- No duplicate slugs are created
- The original tag name casing is preserved when connecting

### 3. Updated API Routes

**Modified Files:**
- `src/app/api/posts/route.ts` (POST endpoint)
- `src/app/api/posts/[id]/route.ts` (PUT endpoint)

Both now:
- Use `generateUniqueSlug()` for post slugs
- Use slug-based lookup for tags and categories
- Include better error handling and logging

### 4. Added Comprehensive Tests

Created `src/lib/slug.test.ts` with 11 test cases covering:
- Basic slugification (lowercase, spaces, special chars)
- Uniqueness checking
- Number appending when duplicates exist
- Excluding current post ID during updates

**All tests pass ✅**

## Benefits

1. **No More Duplicate Slug Errors**: Posts with similar titles now get unique slugs automatically
2. **Case-Insensitive Tag/Category Matching**: "testing", "Testing", and "TESTING" all match the same tag
3. **Preserves Original Casing**: When you type "React", it connects to the existing "React" tag (not "react")
4. **DRY Code**: Slug logic is centralized in a reusable utility
5. **Type-Safe**: Full TypeScript support with proper types
6. **Well-Tested**: Comprehensive test coverage
7. **SEO-Friendly**: Maintains readable URLs (e.g., `my-post`, `my-post-1`, `my-post-2`)
8. **Better Error Handling**: Clear error messages with proper HTTP status codes

## Example Behavior

### Post Slugs
| Post Title      | Generated Slug | Existing Slugs        |
|----------------|----------------|-----------------------|
| "Hello World"  | `hello-world`  | (none)               |
| "Hello World"  | `hello-world-1`| `hello-world`        |
| "Hello World!" | `hello-world-2`| `hello-world`, `hello-world-1` |

### Tag/Category Matching (Case-Insensitive)
| User Input | Existing Tag | Result |
|-----------|--------------|--------|
| "testing" | `Testing` (slug: `testing`) | ✅ Connects to existing "Testing" tag |
| "REACT"   | `React` (slug: `react`) | ✅ Connects to existing "React" tag |
| "nextjs"  | (none) | ✅ Creates new tag "nextjs" with slug "nextjs" |

## Database Impact

No database schema changes required. The fix works with the existing unique constraint on `Post.slug`.

## Migration Notes

- No migration needed
- Existing posts are unaffected
- New posts will automatically get unique slugs
- Updates to existing posts will preserve their slugs unless the title changes
