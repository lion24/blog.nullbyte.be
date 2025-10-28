import type { Metadata } from "next";
import {notFound} from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Providers } from "../providers";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
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
  
  // Validate locale
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  
  // Pass the locale to getMessages
  const messages = await getMessages({locale});

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <Providers>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-1" style={{ backgroundColor: 'var(--background)' }}>
            {children}
          </main>
          <Footer />
        </div>
      </Providers>
    </NextIntlClientProvider>
  );
}
