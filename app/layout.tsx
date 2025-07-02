import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "",
  description: "",
};

export default function RootLayout({ children }: ReactChildNode) {
  return (
    <html lang="he" dir="rtl">
      <body className={` antialiased`}>{children}</body>
    </html>
  );
}
