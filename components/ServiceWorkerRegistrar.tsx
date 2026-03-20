"use client";

import { useEffect } from "react";

const ServiceWorkerRegistrar = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            // Check for updates
            registration.update();
          })
          .catch((err) => console.error("SW registration failed:", err));
      };

      // Register immediately if page is already loaded, otherwise wait
      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
        return () => window.removeEventListener("load", registerSW);
      }
    }
  }, []);

  return null;
};

export default ServiceWorkerRegistrar;
