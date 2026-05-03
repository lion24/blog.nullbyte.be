import type { Metadata } from "next";
import {notFound} from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Providers } from "../providers";
import { getBaseUrl } from '@/lib/url';
import {routing} from '@/i18n/routing';

const OG_LOCALE: Record<string, string> = {
  en: 'en_US',
  fr: 'fr_FR',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = getBaseUrl();
  const localeUrl = `${baseUrl}/${locale}`;
  const description = 'A modern tech blog sharing development insights, tutorials, and discoveries in software engineering.';

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: 'NullByte - Tech Blog',
      template: '%s | NullByte',
    },
    description,
    keywords: ['programming', 'web development', 'software engineering', 'tech blog', 'coding tutorials', 'javascript', 'typescript', 'react', 'nextjs'],
    authors: [{ name: 'Lionel H' }],
    creator: 'Lionel H',
    alternates: {
      canonical: localeUrl,
      languages: {
        'x-default': `${baseUrl}/${routing.defaultLocale}`,
        en: `${baseUrl}/en`,
        fr: `${baseUrl}/fr`,
      },
    },
    openGraph: {
      type: 'website',
      locale: OG_LOCALE[locale] ?? OG_LOCALE[routing.defaultLocale],
      url: localeUrl,
      siteName: 'NullByte',
      title: 'NullByte',
      description,
      images: [
        {
          url: '/logo.png',
          width: 1536,
          height: 1024,
          alt: 'NullByte Logo',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'NullByte',
      description,
      images: ['/logo.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages({locale});

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <Providers>{children}</Providers>
    </NextIntlClientProvider>
  );
}
