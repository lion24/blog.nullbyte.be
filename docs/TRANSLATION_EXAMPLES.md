/**
 * EXAMPLE: Using the Strongly Typed i18n System
 * 
 * This file demonstrates how to use the new strongly typed translation system
 * in both server and client components.
 */

// ============================================================================
// EXAMPLE 1: Server Component with localize()
// ============================================================================

import { localize } from '@/i18n/localize'
import { HomeT, CommonT } from '@/messages/types'

export default async function HomePage() {
  // Get strongly typed translation objects
  const home = await localize(HomeT)
  const common = await localize(CommonT)

  return (
    <div>
      {/* Access translations with full type safety */}
      <h1>{home.title}</h1>
      <p>{home.subtitle}</p>
      
      {/* Pass entire translation namespace to child component */}
      <MyClientButton translations={common} />
      
      {/* Or pass just what you need */}
      <AnotherComponent 
        labels={{ 
          save: common.cancel, 
          cancel: common.cancel 
        }} 
      />
    </div>
  )
}

// ============================================================================
// EXAMPLE 2: Client Component Receiving Translations as Props
// ============================================================================

'use client'

import type { CommonT } from '@/messages/types'

interface MyClientButtonProps {
  translations: CommonT  // Fully typed!
}

export function MyClientButton({ translations }: MyClientButtonProps) {
  const handleClick = () => {
    // All properties are typed and autocomplete works perfectly
    alert(translations.loading)
  }

  return (
    <button onClick={handleClick}>
      {translations.signIn}
    </button>
  )
}

// ============================================================================
// EXAMPLE 3: Using Partial Translations (Pick/Omit)
// ============================================================================

import type { AdminT } from '@/messages/types'

interface PostFormProps {
  // Only require specific fields from AdminT
  buttonLabels: Pick<AdminT, 'save' | 'cancel' | 'delete'>
}

export function PostForm({ buttonLabels }: PostFormProps) {
  return (
    <div>
      <button>{buttonLabels.save}</button>
      <button>{buttonLabels.cancel}</button>
      <button>{buttonLabels.delete}</button>
    </div>
  )
}

// Usage in parent:
async function AdminPage() {
  const admin = await localize(AdminT)
  
  // TypeScript ensures we pass the required fields
  return <PostForm buttonLabels={{
    save: admin.save,
    cancel: admin.cancel,
    delete: admin.delete
  }} />
}

// ============================================================================
// EXAMPLE 4: Multiple Namespaces in One Component
// ============================================================================

import { PostsT, ErrorsT } from '@/messages/types'

async function PostListPage() {
  // Load multiple namespaces as needed
  const posts = await localize(PostsT)
  const errors = await localize(ErrorsT)

  return (
    <div>
      <h1>{posts.allPosts}</h1>
      <p>{posts.loadingPosts}</p>
      
      {/* Use error translations if needed */}
      <ErrorBoundary errorText={errors.somethingWrong} />
    </div>
  )
}

// ============================================================================
// EXAMPLE 5: Nested Translation Objects
// ============================================================================

// If your translations have nested structures, they're fully typed too!
// For example, if you had a namespace like this:

export class SettingsT implements Translation {
  namespace?: keyof FullTranslation = 'settings'
  
  profile = {
    title: '',
    updateButton: '',
    deleteButton: ''
  }
  
  privacy = {
    title: '',
    description: ''
  }
}

// Usage:
async function SettingsPage() {
  const settings = await localize(SettingsT)
  
  return (
    <div>
      <h2>{settings.profile.title}</h2>
      <button>{settings.profile.updateButton}</button>
      
      <h2>{settings.privacy.title}</h2>
      <p>{settings.privacy.description}</p>
    </div>
  )
}

// You can also pass nested parts:
interface ProfileSectionProps {
  translations: SettingsT['profile']
}

// ============================================================================
// EXAMPLE 6: Traditional useTranslations() Still Works
// ============================================================================

'use client'

import { useTranslations } from 'next-intl'

export function TraditionalComponent() {
  // You can still use the traditional approach when needed
  const t = useTranslations('common')
  
  return <button>{t('signIn')}</button>
}

// Use traditional approach when:
// - You only need 1-2 translations
// - Working with dynamic keys
// - Need runtime key computation

// ============================================================================
// EXAMPLE 7: Server-Side getTranslations() Still Works
// ============================================================================

import { getTranslations } from 'next-intl/server'

async function TraditionalServerComponent() {
  // Traditional approach for simple cases
  const t = await getTranslations('common')
  
  return <div>{t('home')}</div>
}

// ============================================================================
// BEST PRACTICES
// ============================================================================

/**
 * 1. Use localize() for components that need multiple translations
 * 2. Use traditional t() for 1-2 translations or dynamic keys
 * 3. Pass translation objects down from server to client components
 * 4. Use Pick/Omit to pass only needed translations
 * 5. Keep translation namespaces focused and cohesive
 * 6. Let TypeScript catch missing translations at compile time!
 */

// ============================================================================
// MIGRATING FROM TRADITIONAL APPROACH
// ============================================================================

// BEFORE (Traditional):
/*
'use client'
import { useTranslations } from 'next-intl'

export function OldComponent() {
  const t = useTranslations('common')
  return (
    <div>
      <h1>{t('home')}</h1>
      <button>{t('signIn')}</button>
      <button>{t('signOut')}</button>
    </div>
  )
}
*/

// AFTER (Strongly Typed):
/*
// Parent (Server Component)
import { localize } from '@/i18n/localize'
import { CommonT } from '@/messages/types'

export default async function Page() {
  const common = await localize(CommonT)
  return <NewComponent translations={common} />
}

// Child (Client Component)
'use client'
import type { CommonT } from '@/messages/types'

export function NewComponent({ translations }: { translations: CommonT }) {
  return (
    <div>
      <h1>{translations.home}</h1>
      <button>{translations.signIn}</button>
      <button>{translations.signOut}</button>
    </div>
  )
}
*/
