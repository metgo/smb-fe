import "./globals.css";

import { Suspense } from "react";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";

import { ProgressBar } from "@/components/wrappers";
import {
  GOOGLE_ANALYTIC_ID,
  GOOGLE_SITE_VERIFICATION_CODE,
  GOOGLE_TAG_MANAGER_ID,
  IdentifierId,
} from "@/constant/envConstants";
import { SiteInfoClientProvider } from "@/providers/SiteInfoClientProvider";
import { urls } from "@/lib/endpoints";
import { getFavicon, getLogo } from "@/constant/images";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

// Dynamic metadata
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
            url: getLogo().image.black,
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
        images: [getLogo().image.black],
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
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta
          name="google-site-verification"
          content={GOOGLE_SITE_VERIFICATION_CODE}
        />
      </head>
      <body>
        <Suspense>
          <SiteInfoClientProvider>
            <GoogleAnalytics gaId={GOOGLE_ANALYTIC_ID!} />
            <GoogleTagManager gtmId={GOOGLE_TAG_MANAGER_ID!} />

            <ProgressBar />
            <Toaster />
            <ServiceWorkerRegistrar />
            {children}
          </SiteInfoClientProvider>
        </Suspense>
      </body>
    </html>
  );
}
