import type { Translation } from './Translation'
import type { FullTranslation } from './FullTranslation'

/**
 * LocaleSwitcherT namespace class - represents the locale switcher translations structure.
 * Use this class with the localize() function to get strongly typed translations.
 */
export class LocaleSwitcherT implements Translation {
  namespace?: keyof FullTranslation = 'LocaleSwitcher'

  switchLocale = ''
}
