export const envKeys = {
  baseUrl: import.meta.env.VITE_SERVER,
  // Marketplace-BE, which serves the onboarding AI endpoints. Falls back to
  // the main API when both are served from the same host.
  onboardingUrl:
    import.meta.env.VITE_ONBOARDING_SERVER || import.meta.env.VITE_SERVER,
  googleMapApiKey: import.meta.env.VITE_GOOGLE_MAP_API,
  googleMapId: import.meta.env.VITE_GOOGLE_MAP_ID,
  maxboxApiKey: import.meta.env.VITE_MAXBOX_API,
  maxboxAccessToken: import.meta.env.VITE_MAXBOX_ACCESS_TOKEN,
};
