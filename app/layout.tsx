import { Space_Grotesk } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { ThemeProviders } from "./theme-providers";
import SectionContainer from "@/components/SectionContainer";
import siteMetadata from "@/data/siteMetadata";

import "./global.css";

const space_grotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "0xlionel blog",
  description: "Bienvenue chez 0xlionel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={siteMetadata.language}
      className={`${space_grotesk.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="bg-white pl-[calc(100vw-100%)] text-black antialiased dark:bg-gray-950 dark:text-white">
        <ThemeProviders>
          <GoogleAnalytics gaId={process.env.GA_ANALYTICS_ID} />
          <SectionContainer>
            {/* TODO: header */}
            <main className="mb-auto">{children}</main>
          </SectionContainer>
        </ThemeProviders>
      </body>
    </html>
  );
}
