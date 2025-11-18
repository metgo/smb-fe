"use client";

import { useEffect } from "react";

const ServiceWorkerRegistrar = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then(() => {})
          .catch((err) => console.error("SW registration failed:", err));
      });
    }
  }, []);

  return null;
};

export default ServiceWorkerRegistrar;
