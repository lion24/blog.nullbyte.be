import { Geist, Geist_Mono, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config as faConfig } from '@fortawesome/fontawesome-svg-core';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GoogleAnalytics } from '@next/third-parties/google'
import { GoogleTagManager } from '@next/third-parties/google'
import { Metadata } from "next";
import { routing } from '@/i18n/routing';

faConfig.autoAddCss = false;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Build Log world: display face for commit messages, nav and footer.
const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  verification: {
    google: 'AlxH2V-DIUqc-nQG8GL_kobCYjVil7obsQYp3XiolOs',

  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Hardcoded default locale so this layout does not call any dynamic API
  // (getLocale reads request state). Without this, every descendant route is
  // forced into dynamic rendering and the edge cannot cache HTML.
  return (
    // The font variables go on <html>: Tailwind declares --font-sans / --font-mono on :root,
    // and a custom property resolves where it is declared, so they must exist there.
    <html
      lang={routing.defaultLocale}
      className={`${geistSans.variable} ${geistMono.variable} ${schibstedGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
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
