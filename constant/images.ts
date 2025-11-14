import { CODE } from "./envConstants";

export const images = {
  BNEI: {
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
    thumbnail: {
      desktop: "/images/thumbnail/negevtime-desktop-thumbnail.webp",
      mobile: "/images/thumbnail/negevtime-mobile-thumbnail.webp",
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
    thumbnail: {
      desktop: "/images/thumbnail/negevtime-desktop-thumbnail.webp",
      mobile: "/images/thumbnail/negevtime-mobile-thumbnail.webp",
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
    thumbnail: {
      desktop: "/images/thumbnail/hofash-thumbnail.webp",
      mobile: "/images/thumbnail/hofash-thumbnail.webp",
    },
    favicon: "/images/favicon/hofash.ico",
  },
} as const;

export function getThumbnail() {
  const thumbnail = images[CODE as keyof typeof images]?.thumbnail;
  return thumbnail;
}

export function getLogo() {
  const logo = images[CODE as keyof typeof images]?.logo;
  return logo;
}

export function getFavicon() {
  const faviconUrl = images[CODE as keyof typeof images]?.favicon;
  return faviconUrl;
}
