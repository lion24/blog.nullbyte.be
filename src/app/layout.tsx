import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GoogleAnalytics } from '@next/third-parties/google'
import { GoogleTagManager } from '@next/third-parties/google'
import { getBaseUrl } from '@/lib/url'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NullByte - Tech Blog',
    description: 'A modern tech blog sharing development insights, tutorials, and discoveries in software engineering.',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleTagManager gtmId="GTM-MNVQRFQH" />
        <GoogleAnalytics gaId="G-E7TZNGYFDS" />
        <Analytics />
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1" style={{ backgroundColor: 'var(--background)' }}>
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
