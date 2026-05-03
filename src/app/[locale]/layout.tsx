import type { Metadata } from "next";
import {notFound} from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Providers } from "../providers";
import { getBaseUrl } from '@/lib/url';
import {routing} from '@/i18n/routing';

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: 'NullByte - Tech Blog',
    template: '%s | NullByte',
  },
  description: 'A modern tech blog sharing development insights, tutorials, and discoveries in software engineering.',
  keywords: ['programming', 'web development', 'software engineering', 'tech blog', 'coding tutorials', 'javascript', 'typescript', 'react', 'nextjs'],
  authors: [{ name: 'Lionel H' }],
  creator: 'Lionel H',
  alternates: {
    canonical: getBaseUrl(),
    languages: {
      'en': `${getBaseUrl()}/en`,
      'fr': `${getBaseUrl()}/fr`,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: getBaseUrl(),
    siteName: 'NullByte',
    title: 'NullByte - Tech Blog',
    description: 'A modern tech blog sharing development insights, tutorials, and discoveries in software engineering.',
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
    title: 'NullByte - Tech Blog',
    description: 'A modern tech blog sharing development insights, tutorials, and discoveries in software engineering.',
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
