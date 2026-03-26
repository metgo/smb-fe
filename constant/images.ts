import { CODE, BUCKET_URL } from "./envConstants";

export const images = {
  BNEI: {
    logo: {
      image: {
        black: `${BUCKET_URL}/images/logo/black.svg`,
        white: `${BUCKET_URL}/images/logo/white.svg`,
      },
      size: {
        height: 100,
        width: 80,
      },
    },
    thumbnail: {
      desktop: `${BUCKET_URL}/images/thumbnail/desktop.webp`,
      mobile: `${BUCKET_URL}/images/thumbnail/mobile.webp`,
    },
    favicon: "/images/favicon/negevtime.ico",
    contactPageBg: `${BUCKET_URL}/images/background/contact-us.png`,
  },
  KEFBA: {
    logo: {
      image: {
        black: `${BUCKET_URL}/images/logo/black.svg`,
        white: `${BUCKET_URL}/images/logo/white.svg`,
      },
      size: {
        height: 100,
        width: 60,
      },
    },
    thumbnail: {
      desktop: `${BUCKET_URL}/images/thumbnail/images_thumbnail_desktop.webp`,
      mobile: `${BUCKET_URL}/images/thumbnail/images_thumbnail_mobile.webp`,
    },
    favicon: "/images/favicon/kefotef.ico",
    contactPageBg: `${BUCKET_URL}/images/background/contact-us.png`,
  },
  TAV8: {
    logo: {
      image: {
        black: `${BUCKET_URL}/images/logo/white.svg`,
        white: `${BUCKET_URL}/images/logo/white.svg`,
      },
      size: {
        height: 50,
        width: 66,
      },
    },
    thumbnail: {
      desktop: `${BUCKET_URL}/images/thumbnail/desktop.webp`,
      mobile: `${BUCKET_URL}/images/thumbnail/mobile.webp`,
    },
    favicon: "/images/favicon/hataze.ico",
    contactPageBg: `${BUCKET_URL}/images/background/contact-us.png`,
  },
  HOFASH: {
    logo: {
      image: {
        black: `${BUCKET_URL}/images/logo/black.svg`,
        white: `${BUCKET_URL}/images/logo/white.svg`,
      },
      size: {
        height: 45,
        width: 56,
      },
    },
    thumbnail: {
      desktop: `${BUCKET_URL}/images/thumbnail/desktop.webp`,
      mobile: `${BUCKET_URL}/images/thumbnail/mobile.webp`,
    },
    favicon: "/images/favicon/hofash.ico",
    contactPageBg: `${BUCKET_URL}/images/background/contact-us.png`,
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
export function getContactPageBg() {
  const contactUsBg = images[CODE as keyof typeof images]?.contactPageBg;
  return contactUsBg;
}
