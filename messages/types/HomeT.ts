import type { Translation } from './Translation'
import type { FullTranslation } from './FullTranslation'

/**
 * HomeT namespace class - represents the home page translations structure.
 * Use this class with the localize() function to get strongly typed translations.
 */
export class HomeT implements Translation {
  namespace?: keyof FullTranslation = 'home'

  title = ''
  subtitle = ''
  latestPosts = ''
  noPosts = ''
  githubProfile = ''
}
