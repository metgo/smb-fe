"use client";

import { ReactNode, useState, useEffect } from "react";
import ScrollSnapWrapper from "./wrappers/ScrollSnapWrapper";

type Props = {
  children: ReactNode;
  hasMarketing?: boolean;
};

export default function HomePageClient({
  children,
  hasMarketing = false,
}: Props) {
  const [childArray, setChildArray] = useState<ReactNode[]>([]);

  useEffect(() => {
    // Convert children to array on client
    const arr = Array.isArray(children) ? children : [children];
    setChildArray(arr);
  }, [children]);

  // Ensure we have 3 children for ScrollSnapWrapper
  const videoSection = childArray[0] || null;
  const marketingSection = childArray[1] || null;
  const feedSection = childArray[2] || null;

  return (
    <ScrollSnapWrapper hasMarketing={hasMarketing}>
      {[videoSection, marketingSection, feedSection]}
    </ScrollSnapWrapper>
  );
}
