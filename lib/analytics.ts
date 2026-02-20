export const sendGAEvent = (eventName: string, eventParams: any) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventParams);
    console.log("GA Event sent:", { eventName, ...eventParams });
  } else {
    console.warn("Google Analytics not loaded yet.");
  }
};
