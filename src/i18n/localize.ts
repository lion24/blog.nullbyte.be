import { getTranslations } from 'next-intl/server'
import type { Translation } from '../../messages/types/Translation'

/**
 * Internal type used to map translation keys to their getter paths
 */
type TranslationGetter = {
  key: string
  getter: string | TranslationGetter[]
}

/**
 * Recursively builds a map of keys to getter paths for a translation namespace
 * @param translations - The translation class instance
 * @param previousKey - The parent key path (for nested objects)
 * @returns Array of TranslationGetter objects
 */
function getKeyGettersMap<T extends Translation>(
  translations: T,
  previousKey?: string
): TranslationGetter[] {
  const keys: TranslationGetter[] = []

  for (const key in translations) {
    // Skip the namespace property as it's metadata
    if (key === 'namespace') {
      continue
    } else if (typeof translations[key] === 'object' && translations[key] !== null) {
      // Handle nested objects recursively
      const subkeys = getKeyGettersMap(
        translations[key] as unknown as Translation,
        previousKey ? `${previousKey}.${key}` : key
      )
      keys.push({
        key,
        getter: subkeys,
      })
    } else {
      // Handle primitive values (strings)
      keys.push({
        key,
        getter: previousKey ? `${previousKey}.${key}` : key,
      })
    }
  }

  return keys
}

/**
 * Recursively resolves translation values from the translation function
 * @param gettersMap - Array of TranslationGetter objects
 * @param t - The translation function from next-intl
 * @returns Object with resolved translations
 */
async function resolveTranslation(
  gettersMap: TranslationGetter[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {}

  for (const item of gettersMap) {
    if (typeof item.getter === 'string') {
      // Resolve primitive translation
      result[item.key] = t(item.getter)
    } else {
      // Resolve nested object recursively
      result[item.key] = await resolveTranslation(item.getter, t)
    }
  }

  return result
}

/**
 * Localize function - converts a translation namespace class into a strongly typed translation object.
 * 
 * This function provides a fully server-side, strongly typed translation system that:
 * - Returns structured translation objects instead of requiring multiple t() calls
 * - Maintains type safety through TypeScript classes
 * - Enables easy prop drilling with proper types
 * - Works entirely on the server (no client-side context needed)
 * 
 * @example
 * ```typescript
 * // In a server component
 * import { localize } from '@/i18n/localize'
 * import { HomeT } from '@/messages/types/HomeT'
 * 
 * const MyComponent = async () => {
 *   const translations = await localize(HomeT)
 *   return (
 *     <div>
 *       <h1>{translations.title}</h1>
 *       <p>{translations.subtitle}</p>
 *     </div>
 *   )
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Passing to client components with proper typing
 * import { CommonT } from '@/messages/types/CommonT'
 * 
 * const ServerComponent = async () => {
 *   const translations = await localize(CommonT)
 *   return <ClientButton translations={translations} />
 * }
 * 
 * // In the client component - fully typed!
 * 'use client'
 * const ClientButton = ({ translations }: { translations: CommonT }) => {
 *   return <button>{translations.cancel}</button>
 * }
 * ```
 * 
 * @param TranslationClass - A translation namespace class (e.g., CommonT, HomeT, PostsT)
 * @returns A promise that resolves to a strongly typed translation object
 */
export async function localize<T extends Translation>(
  TranslationClass: new () => T
): Promise<T> {
  // Create an instance of the translation class
  const translationInstance = new TranslationClass()

  // Get the namespace key (e.g., 'common', 'home', 'posts')
  const namespace = translationInstance.namespace

  if (!namespace) {
    throw new Error(
      `Translation class must have a namespace property. Make sure the class implements Translation interface correctly.`
    )
  }

  // Get the translation function for this namespace
  const t = await getTranslations(String(namespace))

  // Build the key-to-getter map
  const gettersMap = getKeyGettersMap(translationInstance)

  // Resolve all translations recursively
  const resolvedTranslations = await resolveTranslation(gettersMap, t)

  return resolvedTranslations as T
}
