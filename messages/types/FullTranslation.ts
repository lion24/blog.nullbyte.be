import type { AdminT } from './AdminT'
import type { AuthT } from './AuthT'
import type { BreadcrumbT } from './BreadcrumbT'
import type { CommonT } from './CommonT'
import type { ErrorsT } from './ErrorsT'
import type { FooterT } from './FooterT'
import type { HomeT } from './HomeT'
import type { LocaleSwitcherT } from './LocaleSwitcherT'
import type { NavigationT } from './NavigationT'
import type { PostsT } from './PostsT'
import type { SocialT } from './SocialT'

/**
 * FullTranslation type - maps namespace names to their corresponding translation class types.
 * This type ensures type safety across all translation namespaces.
 * 
 * When adding a new namespace:
 * 1. Create a new *T.ts class file
 * 2. Import it here
 * 3. Add it to this type definition
 * 4. Update both en.ts and fr.ts translation files
 */
export type FullTranslation = {
  common: CommonT
  home: HomeT
  posts: PostsT
  breadcrumb: BreadcrumbT
  admin: AdminT
  auth: AuthT
  footer: FooterT
  navigation: NavigationT
  social: SocialT
  errors: ErrorsT
  LocaleSwitcher: LocaleSwitcherT
}
