import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'always',
  // Disabled so the i18n middleware stops setting the NEXT_LOCALE cookie on
  // every response — that cookie is what forces dynamic rendering and prevents
  // the edge from caching HTML. Visitors to "/" get redirected to defaultLocale.
  localeDetection: false
});
