# Quick Start: Strongly Typed i18n

## TL;DR

```typescript
// 1. Server Component - Get translations
import { localize } from '@/i18n/localize'
import { HomeT } from '@/messages/types'

const home = await localize(HomeT)
console.log(home.title) // Fully typed!

// 2. Client Component - Receive as props
'use client'
import type { CommonT } from '@/messages/types'

function Button({ t }: { t: CommonT }) {
  return <button>{t.signIn}</button>
}
```

## Quick Examples

### Get Translations in Server Component

```typescript
import { localize } from '@/i18n/localize'
import { CommonT, HomeT, PostsT } from '@/messages/types'

export default async function Page() {
  const common = await localize(CommonT)
  const home = await localize(HomeT)
  const posts = await localize(PostsT)
  
  return (
    <div>
      <h1>{home.title}</h1>
      <p>{posts.allPosts}</p>
      <button>{common.signIn}</button>
    </div>
  )
}
```

### Pass to Client Component

```typescript
// Server Component
import { localize } from '@/i18n/localize'
import { CommonT } from '@/messages/types'
import { MyButton } from './MyButton'

export default async function Page() {
  const common = await localize(CommonT)
  return <MyButton translations={common} />
}

// Client Component (MyButton.tsx)
'use client'
import type { CommonT } from '@/messages/types'

export function MyButton({ translations }: { translations: CommonT }) {
  return <button>{translations.signIn}</button>
}
```

## Available Namespaces

Import from `@/messages/types`:

- `CommonT` - Common UI text (buttons, navigation)
- `HomeT` - Home page content
- `PostsT` - Post-related text
- `AdminT` - Admin interface
- `AuthT` - Authentication messages
- `FooterT` - Footer content
- `NavigationT` - Navigation
- `SocialT` - Social sharing
- `ErrorsT` - Error messages
- `BreadcrumbT` - Breadcrumbs
- `LocaleSwitcherT` - Locale switcher

## Traditional Approach Still Works

```typescript
// Client Component
import { useTranslations } from 'next-intl'
const t = useTranslations('common')

// Server Component
import { getTranslations } from 'next-intl/server'
const t = await getTranslations('common')
```

Use `localize()` for better type safety!

## Full Documentation

- 📖 See [`../messages/README.md`](../messages/README.md) for detailed guide
- 💡 See [`TRANSLATION_EXAMPLES.md`](./TRANSLATION_EXAMPLES.md) for more examples
- 📝 See [`../CLAUDE.md`](../CLAUDE.md) for complete architecture docs
