import type { Translation } from './Translation'
import type { FullTranslation } from './FullTranslation'

/**
 * CommonT namespace class - represents the common translations structure.
 * Use this class with the localize() function to get strongly typed translations.
 */
export class CommonT implements Translation {
  namespace?: keyof FullTranslation = 'common'

  home = ''
  blog = ''
  posts = ''
  admin = ''
  signIn = ''
  signOut = ''
  loading = ''
  error = ''
  search = ''
  readMore = ''
  readMoreArrow = ''
  by = ''
  views = ''
  minRead = ''
  readingTime = ''
  email = ''
  goHome = ''
  edit = ''
  view = ''
  cancel = ''
  backToAllPosts = ''
}
