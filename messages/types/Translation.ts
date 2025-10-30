import type { FullTranslation } from './FullTranslation'

/**
 * Base interface for all translation namespace classes.
 * Each namespace class must implement this interface and specify its namespace key.
 */
export interface Translation {
  namespace?: keyof FullTranslation
}
