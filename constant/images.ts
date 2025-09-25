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
  },
} as const;

export function getLogo(key: string | undefined) {
  if (!key || !(key in images)) return undefined;

  const logo = images[key as keyof typeof images].logo;

  return logo;
}
