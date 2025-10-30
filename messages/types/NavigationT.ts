import type { Translation } from './Translation'
import type { FullTranslation } from './FullTranslation'

/**
 * NavigationT namespace class - represents the navigation translations structure.
 * Use this class with the localize() function to get strongly typed translations.
 */
export class NavigationT implements Translation {
  namespace?: keyof FullTranslation = 'navigation'

  brand = ''
}
