# Strongly Typed i18n System

This directory contains the translation system for the blog, implementing a fully server-side, strongly typed internationalization approach using `next-intl`.

## Directory Structure

```
messages/
├── en.ts                    # English translations
├── fr.ts                    # French translations
├── types/                   # TypeScript namespace classes
│   ├── index.ts            # Central export for all types
│   ├── Translation.ts      # Base interface
│   ├── FullTranslation.ts  # Type mapping all namespaces
│   ├── CommonT.ts          # Common UI translations
│   ├── HomeT.ts            # Home page translations
│   ├── PostsT.ts           # Posts translations
│   ├── AdminT.ts           # Admin interface translations
│   ├── AuthT.ts            # Authentication translations
│   ├── FooterT.ts          # Footer translations
│   ├── NavigationT.ts      # Navigation translations
│   ├── SocialT.ts          # Social sharing translations
│   ├── ErrorsT.ts          # Error messages
│   ├── BreadcrumbT.ts      # Breadcrumb translations
│   └── LocaleSwitcherT.ts  # Locale switcher translations
└── README.md               # This file
```

## How It Works

### 1. Translation Files (en.ts, fr.ts)

TypeScript files (not JSON) that export translation objects typed with `FullTranslation`:

```typescript
import type { FullTranslation } from './types/FullTranslation'

const en: FullTranslation = {
  common: {
    home: 'Home',
    signIn: 'Sign In',
    // ...
  },
  home: {
    title: 'Welcome to the Blog',
    // ...
  }
}

export default en
```

### 2. Namespace Classes (types/*.ts)

Each namespace has a TypeScript class that:
- Implements the `Translation` interface
- Defines the structure with empty strings
- Specifies its namespace key

```typescript
export class CommonT implements Translation {
  namespace?: keyof FullTranslation = 'common'
  
  home = ''
  signIn = ''
  // ...
}
```

### 3. The `localize()` Function

Located in `src/i18n/localize.ts`, this function:
- Takes a namespace class as input
- Returns a fully typed translation object
- Works entirely server-side

```typescript
const translations = await localize(CommonT)
// translations is now type CommonT with all values populated
```

## Usage Examples

### Server Component

```typescript
import { localize } from '@/i18n/localize'
import { HomeT, CommonT } from '@/messages/types'

export default async function HomePage() {
  const home = await localize(HomeT)
  const common = await localize(CommonT)

  return (
    <div>
      <h1>{home.title}</h1>
      <p>{home.subtitle}</p>
      <ClientButton translations={common} />
    </div>
  )
}
```

### Client Component

```typescript
'use client'

import type { CommonT } from '@/messages/types'

interface Props {
  translations: CommonT
}

export function ClientButton({ translations }: Props) {
  return <button>{translations.signIn}</button>
}
```

### Partial Translations

```typescript
// Only pass what you need
interface Props {
  labels: Pick<AdminT, 'save' | 'cancel' | 'delete'>
}
```

## Adding New Translations

### Step 1: Create Namespace Class

```typescript
// types/MyFeatureT.ts
import type { Translation } from './Translation'

export class MyFeatureT implements Translation {
  namespace?: keyof import('./FullTranslation').FullTranslation = 'myFeature'
  
  title = ''
  description = ''
  action = ''
}
```

### Step 2: Update FullTranslation

```typescript
// types/FullTranslation.ts
import type { MyFeatureT } from './MyFeatureT'

export type FullTranslation = {
  // ... existing
  myFeature: MyFeatureT
}
```

### Step 3: Add Translations

```typescript
// en.ts
const en: FullTranslation = {
  // ... existing
  myFeature: {
    title: 'My Feature',
    description: 'Feature description',
    action: 'Take action'
  }
}

// fr.ts
const fr: FullTranslation = {
  // ... existing
  myFeature: {
    title: 'Ma fonctionnalité',
    description: 'Description de la fonctionnalité',
    action: 'Agir'
  }
}
```

### Step 4: Export

```typescript
// types/index.ts
export { MyFeatureT } from './MyFeatureT'
```

### Step 5: Use

```typescript
import { localize } from '@/i18n/localize'
import { MyFeatureT } from '@/messages/types'

const t = await localize(MyFeatureT)
```

## Benefits

✅ **Type Safety**: Catch missing/misspelled keys at compile time  
✅ **Single Call**: Get all namespace translations at once  
✅ **Structured Props**: Pass typed objects to components  
✅ **Server-Side**: No client-side translation overhead  
✅ **Autocomplete**: Full IDE support for all keys  
✅ **Maintainable**: TypeScript highlights all affected files on changes  

## Comparison with Traditional next-intl

### Traditional Approach ❌

```typescript
const t = useTranslations('common')
const home = t('home')
const signIn = t('signIn')
const signOut = t('signOut')
// Repeated calls, no structure, string keys
```

### Strongly Typed Approach ✅

```typescript
const common = await localize(CommonT)
// common.home, common.signIn, common.signOut
// Single call, structured object, full type safety
```

## When to Use Traditional vs Localize

### Use `localize()` when:
- You need multiple translations from a namespace
- Passing translations to child components
- You want type safety and autocomplete
- Working in server components

### Use traditional `t()` when:
- You only need 1-2 translations
- Working with dynamic translation keys
- Need runtime key computation

Both approaches work together seamlessly!

## Migration Guide

To migrate existing code using traditional `useTranslations()`:

**Before:**
```typescript
'use client'
import { useTranslations } from 'next-intl'

export function Component() {
  const t = useTranslations('common')
  return <button>{t('signIn')}</button>
}
```

**After:**
```typescript
// Parent (Server Component)
import { localize } from '@/i18n/localize'
import { CommonT } from '@/messages/types'

export default async function Page() {
  const common = await localize(CommonT)
  return <Component translations={common} />
}

// Child (Client Component)
'use client'
import type { CommonT } from '@/messages/types'

export function Component({ translations }: { translations: CommonT }) {
  return <button>{translations.signIn}</button>
}
```

## Credits

This implementation is based on the strategy described in:
[A strategy for implementing i18n on NextJs with App router and next-intl, fully server-side](https://javascript.plainenglish.io/a-strategy-for-implementing-i18n-on-nextjs-with-app-router-and-next-intl-fully-server-side-fa6d1c43d17b)

## Additional Documentation

- 📖 See [`../docs/I18N_QUICKSTART.md`](../docs/I18N_QUICKSTART.md) for quick reference
- 💡 See [`../docs/TRANSLATION_EXAMPLES.md`](../docs/TRANSLATION_EXAMPLES.md) for comprehensive examples
- 📝 See [`../docs/I18N_IMPLEMENTATION_SUMMARY.md`](../docs/I18N_IMPLEMENTATION_SUMMARY.md) for implementation details
- 🏗️ See [`CLAUDE.md`](../CLAUDE.md) for complete architecture documentation
