"use client";

import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function HomePageClient({ children }: Props) {
  return <div className="min-h-screen">{children}</div>;
}
