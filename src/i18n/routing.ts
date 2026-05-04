import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'always',
  // Disable Accept-Language / cookie sniffing at "/" so it redirects to
  // defaultLocale without per-request branching. Locale comes from the URL.
  localeDetection: false,
  // Stop the middleware from writing NEXT_LOCALE on every response. The
  // cookie added bytes to each response and prevents some proxies from
  // caching Set-Cookie responses. Locale is in the URL — no cookie needed.
  localeCookie: false
});
