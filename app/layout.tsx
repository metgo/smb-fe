import "./globals.css";

import { Suspense } from "react";
import type { Metadata } from "next";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";

import { ProgressBar } from "@/components/wrappers";
import {
  GOOGLE_ANALYTIC_ID,
  GOOGLE_TAG_MANAGER_ID,
} from "@/constant/envConstants";
import { SiteInfoClientProvider } from "@/providers/SiteInfoClientProvider";

export const metadata: Metadata = {
  title: "תיירות בני שמעון – חוויות, טבע ותוצרת מהנגב הפורח",
  description:
    "קחו נשימה ובואו לגלות את הנגב הפורח: מסלולים, עגלות קפה, סדנאות, תרבות ותוצרת מקומית בבני שמעון. חוויה כפרית קרובה לבית – פשוט, אותנטי ומפתיע.",
};

export default function RootLayout({ children }: ReactChildNode) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <SiteInfoClientProvider>
          <GoogleAnalytics gaId={GOOGLE_ANALYTIC_ID!} />
          <GoogleTagManager gtmId={GOOGLE_TAG_MANAGER_ID!} />
          <Suspense>
            <ProgressBar />
            {children}
          </Suspense>
        </SiteInfoClientProvider>
      </body>
    </html>
  );
}
