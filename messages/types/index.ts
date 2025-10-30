/**
 * Central export file for all translation namespace classes.
 * Import translation classes from here to use with the localize() function.
 * 
 * @example
 * ```typescript
 * import { localize } from '@/i18n/localize'
 * import { CommonT, HomeT, PostsT } from '@/messages/types'
 * 
 * const common = await localize(CommonT)
 * const home = await localize(HomeT)
 * const posts = await localize(PostsT)
 * ```
 */

export { AdminT } from './AdminT'
export { AuthT } from './AuthT'
export { BreadcrumbT } from './BreadcrumbT'
export { CommonT } from './CommonT'
export { ErrorsT } from './ErrorsT'
export { FooterT } from './FooterT'
export { HomeT } from './HomeT'
export { LocaleSwitcherT } from './LocaleSwitcherT'
export { NavigationT } from './NavigationT'
export { PostsT } from './PostsT'
export { SocialT } from './SocialT'
export type { FullTranslation } from './FullTranslation'
export type { Translation } from './Translation'
