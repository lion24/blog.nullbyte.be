import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GoogleAnalytics } from '@next/third-parties/google'
import { GoogleTagManager } from '@next/third-parties/google'
import { Metadata } from "next";
import { getLocale } from 'next-intl/server';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  verification: {
    google: 'AlxH2V-DIUqc-nQG8GL_kobCYjVil7obsQYp3XiolOs',

  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {/* Analytics scripts loaded after content - already optimized with deferred loading */}
        <GoogleTagManager gtmId="GTM-MNVQRFQH" />
        <GoogleAnalytics gaId="G-E7TZNGYFDS" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
