import type { Translation } from './Translation'
import type { FullTranslation } from './FullTranslation'

/**
 * ErrorsT namespace class - represents the errors translations structure.
 * Use this class with the localize() function to get strongly typed translations.
 */
export class ErrorsT implements Translation {
  namespace?: keyof FullTranslation = 'errors'

  notFound = ''
  somethingWrong = ''
  tryAgain = ''
  goHome = ''
}
