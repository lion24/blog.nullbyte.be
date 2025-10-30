import type { Translation } from './Translation'
import type { FullTranslation } from './FullTranslation'

/**
 * AuthT namespace class - represents the authentication translations structure.
 * Use this class with the localize() function to get strongly typed translations.
 */
export class AuthT implements Translation {
  namespace?: keyof FullTranslation = 'auth'

  signInWith = ''
  signInRequired = ''
  adminRequired = ''
  unauthorized = ''
  forbidden = ''
  accessDenied = ''
  accessDeniedMessage = ''
  accessDeniedCreatePost = ''
}
