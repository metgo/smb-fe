"use client";

import "nprogress/nprogress.css";
import NProgress from "nprogress";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Custom CSS for color change and RTL direction
// background: linear-gradient(to right, #667eea 0%, #764ba2 100%) !important; /* Or use gradient */
const progressBarStyles = `
  #nprogress .bar {
    background: #FE333E !important; /* Change this color to your preference */
  }
  
  #nprogress .peg {
    box-shadow: 0 0 10px #29d, 0 0 5px #29d !important;
  }
  
  /* RTL Direction */
  #nprogress .bar {
    transform-origin: right !important;
  }
  
  #nprogress {
    direction: rtl !important;
  }
`;

// Inject custom styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = progressBarStyles;
  document.head.appendChild(styleSheet);
}

NProgress.configure({
  showSpinner: false,
});

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
