import "./globals.css";

import { Suspense } from "react";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";

import {
  GOOGLE_ANALYTIC_ID,
  GOOGLE_SITE_VERIFICATION_CODE,
  GOOGLE_TAG_MANAGER_ID,
} from "@/constant/envConstants";
import Providers from "@/components/wrappers/Providers";
import { getFavicon, getThumbnail } from "@/constant/images";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import InitialLoader from "@/components/InitialLoader";
import { SiteInfoClientProvider } from "@/providers/SiteInfoClientProvider";

// Static metadata - no blocking fetch
export const metadata: Metadata = {
  title: "Metgo Travel",
  description: "Discover amazing travel destinations",
  openGraph: {
    title: "Metgo Travel",
    description: "Discover amazing travel destinations",
    locale: "he_IL",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: getFavicon(),
    apple: getFavicon(),
  },
};

export default function RootLayout({ children }: ReactChildNode) {
  const thumbnail = getThumbnail();

  return (
    <html lang="he" dir="rtl">
      <head>
        <meta
          name="google-site-verification"
          content={GOOGLE_SITE_VERIFICATION_CODE}
        />
        {/* Preload hero thumbnails for instant display */}
        <link
          rel="preload"
          href={thumbnail?.desktop}
          as="image"
          type="image/webp"
        />
        <link
          rel="preload"
          href={thumbnail?.mobile}
          as="image"
          type="image/webp"
          media="(max-width: 768px)"
        />
      </head>
      <body
        className="
          enable-toolbar-RTL
          trigger-position-left
          quick-links-position-center
          trigger-size-medium
        "
      >
        <Suspense fallback={<InitialLoader />}>
          <Providers>
            <SiteInfoClientProvider>
              <GoogleAnalytics debugMode={false} gaId={GOOGLE_ANALYTIC_ID!} />
              <GoogleTagManager gtmId={GOOGLE_TAG_MANAGER_ID!} />

              <Toaster />
              <ServiceWorkerRegistrar />
              {children}
            </SiteInfoClientProvider>
          </Providers>
        </Suspense>
        <script src="https://cdn.enable.co.il/licenses/enable-L51962b1rufewka6-1225-76847/init.js"></script>
      </body>
    </html>
  );
}
