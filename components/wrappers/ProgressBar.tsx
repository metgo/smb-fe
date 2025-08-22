"use client";

import "nprogress/nprogress.css";
import NProgress from "nprogress";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Custom CSS for color change and RTL direction
const progressBarStyles = `

  #nprogress .bar {
    right: 0;              
    left: auto;            
    transform-origin: right;
    background: #00A5A8 !important;
    height: 3px !important;
    transform: scaleX(-1);
    right: 0 !important;
    left: auto !important;
    transform-origin: right !important;
  }
  
  #nprogress .peg {
   right: auto !important;
  left: 0 !important;
  transform: scaleX(-1);
    box-shadow: 0 0 10px #29d, 0 0 5px #29d !important;
  }

`;

// Inject custom styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = progressBarStyles;
  document.head.appendChild(styleSheet);
}

NProgress.configure({ showSpinner: false });

export function startLoading() {
  NProgress.start();
}

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Function to start progress bar on link clicks
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link && link.href) {
        const isExternal =
          link.href.startsWith("http") &&
          !link.href.startsWith(window.location.origin);
        const isAnchor = link.href.includes("#");
        const isNewTab = link.target === "_blank";
        //  || e.metaKey || e.ctrlKey || e.shiftKey;
        const isDownload = link.hasAttribute("download");
        const isMailto = link.href.startsWith("mailto:");
        const isTel = link.href.startsWith("tel:");

        // Start progress bar only for internal navigation
        if (
          !isExternal &&
          !isAnchor &&
          !isNewTab &&
          !isDownload &&
          !isMailto &&
          !isTel
        ) {
          NProgress.start();
        }
      }
    };

    // Add click listener to document
    document.addEventListener("click", handleLinkClick);

    return () => {
      document.removeEventListener("click", handleLinkClick);
    };
  }, []);

  useEffect(() => {
    // Complete the progress bar when navigation is done
    NProgress.done();
  }, [pathname, searchParams]);

  return null;
}
