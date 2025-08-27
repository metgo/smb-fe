import "./globals.css";

import Head from "next/head";
import { Suspense } from "react";
import type { Metadata } from "next";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";

import { ProgressBar } from "@/components/wrappers";
import {
  BUCKET_URL,
  GOOGLE_ANALYTIC_ID,
  GOOGLE_TAG_MANAGER_ID,
} from "@/constant/envConstants";

export const metadata: Metadata = {
  title: "תיירות בני שמעון – חוויות, טבע ותוצרת מהנגב הפורח",
  description:
    "קחו נשימה ובואו לגלות את הנגב הפורח: מסלולים, עגלות קפה, סדנאות, תרבות ותוצרת מקומית בבני שמעון. חוויה כפרית קרובה לבית – פשוט, אותנטי ומפתיע.",
};

export default function RootLayout({ children }: ReactChildNode) {
  return (
    <html lang="he" dir="rtl">
      <Head>
        <link
          rel="preload"
          as="video"
          href={`${BUCKET_URL}/video/intro-video.mp4`}
          type="video/mp4"
        />
      </Head>
      <body>
        <GoogleAnalytics gaId={GOOGLE_ANALYTIC_ID!} />
        <GoogleTagManager gtmId={GOOGLE_TAG_MANAGER_ID!} />
        <Suspense>
          <ProgressBar />
          {children}
        </Suspense>
      </body>
    </html>
  );
}
