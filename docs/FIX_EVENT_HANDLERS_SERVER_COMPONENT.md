# Fix: Event Handlers in Server Component

## Issue

Runtime error when browsing post pages (e.g., `/fr/posts/building-scalable-apis-with-node-js`):

```
Error: Event handlers cannot be passed to Client Component props.
  <... onMouseEnter={function onMouseEnter} onMouseLeave=...>
If you need interactivity, consider converting part of this to a Client Component.
```

## Root Cause

The file `/src/app/[locale]/posts/[slug]/page.tsx` is a **Server Component** (no `'use client'` directive), but it was using event handlers directly on `<Link>` components:

```tsx
<Link
  href={...}
  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
>
  #{tag.name}
</Link>
```

In Next.js 15, Server Components **cannot** use:
- Event handlers (`onClick`, `onMouseEnter`, `onMouseLeave`, etc.)
- React hooks (`useState`, `useEffect`, etc.)
- Browser APIs
- Any interactive JavaScript

## Solution

Used the existing `InteractiveLink` Client Component which already handles hover states properly.

### Changes Made

**File**: `/src/app/[locale]/posts/[slug]/page.tsx`

1. **Added import**:
   ```tsx
   import InteractiveLink from '@/components/InteractiveLink'
   ```

2. **Replaced interactive Link for tags**:
   ```tsx
   // Before:
   <Link
     href={`/${locale}/tags/${tag.slug}`}
     onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
     onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
   >
     #{tag.name}
   </Link>
   
   // After:
   <InteractiveLink
     href={`/${locale}/tags/${tag.slug}`}
     className="text-sm transition-colors"
     baseColor="var(--text-tertiary)"
     hoverColor="var(--text-secondary)"
   >
     #{tag.name}
   </InteractiveLink>
   ```

3. **Replaced interactive Link for back button**:
   ```tsx
   // Before:
   <Link
     href={`/${locale}/posts`}
     onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-hover)'}
     onMouseLeave={(e) => e.currentTarget.style.color = 'var(--primary)'}
   >
     {t('common.backToAllPosts')}
   </Link>
   
   // After:
   <InteractiveLink
     href={`/${locale}/posts`}
     className="inline-flex items-center transition-colors"
     baseColor="var(--primary)"
     hoverColor="var(--primary-hover)"
   >
     {t('common.backToAllPosts')}
   </InteractiveLink>
   ```

## How InteractiveLink Works

The `InteractiveLink` component (already existed in the codebase):
- Is a Client Component (`'use client'`)
- Uses React state to track hover
- Applies hover styles without inline event handlers
- Can be safely used from Server Components

```tsx
'use client'

export default function InteractiveLink({
  href,
  baseColor,
  hoverColor,
  ...
}) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <Link
      href={href}
      style={{
        color: isHovered ? hoverColor : baseColor,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </Link>
  )
}
```

## Testing

✅ Build successful  
✅ No TypeScript errors  
✅ No runtime errors  
✅ Hover effects work correctly  

## Next.js 15 Server/Client Component Rules

### Server Components (default)
- ✅ Can use async/await
- ✅ Can fetch data directly
- ✅ Smaller bundle size
- ❌ Cannot use event handlers
- ❌ Cannot use hooks
- ❌ Cannot use browser APIs

### Client Components (`'use client'`)
- ✅ Can use event handlers
- ✅ Can use hooks (useState, useEffect)
- ✅ Can use browser APIs
- ❌ Cannot be async
- ❌ Larger bundle size (sent to client)

## Best Practice

When you need interactivity in a Server Component:
1. Extract the interactive part into a Client Component
2. Keep as much as possible in the Server Component
3. Use composition to combine them

```tsx
// ✅ Good: Server Component with Client Component children
export default async function ServerPage() {
  const data = await fetchData()
  
  return (
    <div>
      <h1>{data.title}</h1>
      <InteractiveButton onClick={...} /> {/* Client Component */}
    </div>
  )
}
```

## Status

✅ **Fixed** - Post pages now render without runtime errors
