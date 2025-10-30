import type { Translation } from './Translation'
import type { FullTranslation } from './FullTranslation'

/**
 * FooterT namespace class - represents the footer translations structure.
 * Use this class with the localize() function to get strongly typed translations.
 */
export class FooterT implements Translation {
  namespace?: keyof FullTranslation = 'footer'

  techBlog = ''
  tagline = ''
  quickLinks = ''
  home = ''
  allPosts = ''
  connect = ''
  email = ''
  github = ''
  copyright = ''
}
