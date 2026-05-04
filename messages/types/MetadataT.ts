import type { Translation } from './Translation'
import type { FullTranslation } from './FullTranslation'

export class MetadataT implements Translation {
  namespace?: keyof FullTranslation = 'metadata'

  siteTitle = ''
  description = ''
}
