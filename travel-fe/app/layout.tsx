import "./globals.css";

import { Suspense } from "react";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";

import {
  GOOGLE_ANALYTIC_ID,
  GOOGLE_SITE_VERIFICATION_CODE,
  GOOGLE_TAG_MANAGER_ID,
  CODE,
  IdentifierId,
} from "@/constant/envConstants";
import Providers from "@/components/wrappers/Providers";
import { getFavicon, getThumbnail } from "@/constant/images";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import InitialLoader from "@/components/InitialLoader";
import { SiteInfoClientProvider } from "@/providers/SiteInfoClientProvider";
import { urls } from "@/lib/endpoints";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const response = await fetch(`${urls.siteInfo}/${IdentifierId}`);
    if (!response.ok) new Error("Failed to fetch metadata");
    const data = await response.json();

    return {
      title: data.metaTitle || "",
      description: data.metaDescription || "",
      openGraph: {
        title: data.metaTitle,
        description: data.metaDescription,
        url: data?.siteUrl,
        siteName: data?.siteName,
        images: [
          {
            url: getFavicon(),
            width: 1200,
            height: 630,
            alt: "Company Logo",
            type: "image/svg",
          },
        ],
        locale: "he_IL",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: data.metaTitle,
        description: data.metaDescription,
        images: [getFavicon()],
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
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return {
      title: "",
      description: "",
    };
  }
}

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
      <body className="enable-toolbar-RTL trigger-position-left quick-links-position-center trigger-size-medium">
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
        {CODE === "KEFBA" ? (
          <script src="https://cdn.enable.co.il/licenses/enable-L51962b1rufewka6-1225-80734/init.js" />
        ) : (
          <script src="https://cdn.enable.co.il/licenses/enable-L51962b1rufewka6-1225-76847/init.js" />
        )}
      </body>
    </html>
  );
}
