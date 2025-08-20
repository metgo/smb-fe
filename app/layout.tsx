import "./globals.css";

import Head from "next/head";
import type { Metadata } from "next";
import { BUCKET_URL } from "@/constant/envConstants";
import { ProgressBar } from "@/components/wrappers";

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
        <ProgressBar />
        {children}
      </body>
    </html>
  );
}
