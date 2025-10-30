import type { Translation } from './Translation'
import type { FullTranslation } from './FullTranslation'

/**
 * BreadcrumbT namespace class - represents the breadcrumb translations structure.
 * Use this class with the localize() function to get strongly typed translations.
 */
export class BreadcrumbT implements Translation {
  namespace?: keyof FullTranslation = 'breadcrumb'

  home = ''
  posts = ''
}
