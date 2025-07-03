import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "תיירות בני שמעון – חוויות, טבע ותוצרת מהנגב הפורח",
  description:
    "קחו נשימה ובואו לגלות את הנגב הפורח: מסלולים, עגלות קפה, סדנאות, תרבות ותוצרת מקומית בבני שמעון. חוויה כפרית קרובה לבית – פשוט, אותנטי ומפתיע.",
};

export default function RootLayout({ children }: ReactChildNode) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
