import type { Translation } from './Translation'
import type { FullTranslation } from './FullTranslation'

/**
 * SocialT namespace class - represents the social sharing translations structure.
 * Use this class with the localize() function to get strongly typed translations.
 */
export class SocialT implements Translation {
  namespace?: keyof FullTranslation = 'social'

  share = ''
  shareOnFacebook = ''
  shareOnX = ''
  shareOnReddit = ''
  copyLink = ''
}
