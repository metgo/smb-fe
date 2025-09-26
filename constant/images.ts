import { CODE } from "./envConstants";

export const images = {
  BENI: {
    logo: {
      image: {
        black: "/images/logo/negevtime-logo-black.svg",
        white: "/images/logo/negevtime-logo-white.svg",
      },
      size: {
        height: 100,
        width: 80,
      },
    },
    favicon: "/images/favicon/negevtime.ico",
  },
  TAV8DL: {
    logo: {
      image: {
        black: "/images/logo/negevtime-logo-black.svg",
        white: "/images/logo/negevtime-logo-white.svg",
      },
      size: {
        height: 100,
        width: 80,
      },
    },
    favicon: "/images/favicon/negevtime.ico",
  },
  HOFASH: {
    logo: {
      image: {
        white: "/images/logo/hofash-logo.svg",
        black: "/images/logo/hofash-logo.svg",
      },
      size: {
        height: 45,
        width: 56,
      },
    },
    favicon: "/images/favicon/hofash.ico",
  },
} as const;

export function getLogo() {
  const logo = images[CODE as keyof typeof images].logo;

  return logo;
}

export function getFavicon() {
  const faviconUrl = images[CODE as keyof typeof images].favicon;
  return faviconUrl;
}
