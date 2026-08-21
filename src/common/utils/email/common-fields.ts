// 1. Define proper types instead of 'any'
interface ExternalApi {
  _id?: string | { toString(): string };
  identifierId?: string;
  name?: string;
  nameAr?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  websiteUrl?: string;
  facebookUrl?: string;
  whatsappNumber?: string;
}

interface DocUploadService {
  getImageUrlByExternalApiAndTemplate(
    apiId: string,
    templateKey: string
  ): Promise<string | null>;
}

export async function getCommonEmailFields(
  externalApi: ExternalApi,
  docUploadService: DocUploadService,
) {
  const safeId = (externalApi?.identifierId ?? 'default')
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '');
  const bucketUrl = `https://storage.googleapis.com/${safeId}/emails/`;

  // 2. Add try/catch to prevent one failed DB call from crashing the entire Promise.all
  async function getTemplateImage(templateKey: string): Promise<string | null> {
    try {
      if (docUploadService && templateKey && externalApi?._id) {
        return await docUploadService.getImageUrlByExternalApiAndTemplate(
          externalApi._id.toString(),
          templateKey,
        );
      }
    } catch (error) {
      console.error(
        `Failed to fetch template image for key "${templateKey}":`,
        error,
      );
    }
    return null;
  }

  // 3. Define keys to avoid repeating strings and destructuring 10 variables
  const imageKeys = [
    'FOOTER1',
    'FOOTER2',
    'FOOTER3',
    'FOOTER4',
    'FOOTER5',
    'FOOTER_BANNER',
    'FOOTER_BANNER_MOBILE',
    'BANNER_IMG',
    'MOBILE_BANNER_IMG',
    'FOOTER_BANNER_MINISITE_BANNER',
    'FOOTER_BADGE',
  ] as const;

  // Fetch all concurrently
  const results = await Promise.all(imageKeys.map(getTemplateImage));

  // Map results back to an object: { FOOTER1: 'url...', FOOTER2: null, ... }
  const dbImages = Object.fromEntries(
    imageKeys.map((key, index) => [key, results[index]]),
  ) as Record<(typeof imageKeys)[number], string | null>;

  // Helper to easily apply fallbacks without repeating ${bucketUrl}...
  const getImg = (key: keyof typeof dbImages, fallbackPath: string) => dbImages[key] || `${bucketUrl}${fallbackPath}`;

  return {
    bucketUrl,
    emailFields: {
      WEBSITE_NAME: externalApi?.name || externalApi?.nameAr,
      COLOR: externalApi?.primaryColor || '#667eea',
      BG_COLOR: externalApi?.secondaryColor,
      LOGO: externalApi?.logoUrl || `${bucketUrl}logo.png`,

      // Footer Images
      FOOTER1: getImg('FOOTER1', 'footer/footer-image-1.png'),
      FOOTER2: getImg('FOOTER2', 'footer/footer-image-2.png'),
      FOOTER3: getImg('FOOTER3', 'footer/footer-image-3.png'),
      FOOTER4: getImg('FOOTER4', 'footer/footer-image-4.png'),
      FOOTER5: getImg('FOOTER5', 'footer/footer-image-5.png'),
      // FOOTER_BADGE: `${bucketUrl}footer/yellow-ribbon.png`,
      FOOTER_BADGE: getImg('FOOTER_BADGE', 'footer/yellow-ribbon.png'),

      // Links
      FOOTER_LINK1: externalApi?.websiteUrl,
      FOOTER_LINK2: externalApi?.websiteUrl,
      FOOTER_LINK3: externalApi?.websiteUrl,
      FOOTER_LINK4: 'https://workspace.metgo.app/',
      FACEBOOK_LINK: externalApi?.facebookUrl,
      WHATSAPP_LINK: externalApi?.whatsappNumber,

      // Banners
      FOOTER_BANNER: getImg('FOOTER_BANNER', 'footer/footer-banner.png'),
      FOOTER_BANNER_MOBILE: getImg(
        'FOOTER_BANNER_MOBILE',
        'footer/footer-banner-mobile.png',
      ),
      BANNER_IMG:
        dbImages.BANNER_IMG
        || dbImages.FOOTER_BANNER
        || `${bucketUrl}footer/banner-web.png`,
      MOBILE_BANNER_IMG:
        dbImages.MOBILE_BANNER_IMG
        || dbImages.FOOTER_BANNER_MOBILE
        || `${bucketUrl}footer/banner-mobile.png`,
      FOOTER_BANNER_MINISITE_BANNER: getImg(
        'FOOTER_BANNER_MINISITE_BANNER',
        'footer/footer-banner-mini-site.png',
      ),
    },
  };
}
