export function getCommonEmailFields(identifierId: string, externalApi) {
  const bucketName = identifierId.toLowerCase().replace(/[^a-z0-9._-]/g, '');

  const bucketUrl = `https://storage.googleapis.com/${bucketName}/emails/`;

  return {
    bucketUrl,
    emailFields: {
      COLOR: externalApi?.primaryColor,
      LOGO: externalApi?.logoUrl || `${bucketName}.png`,
      FOOTER1: `${bucketUrl}footer/footer-image-1.png`,
      FOOTER2: `${bucketUrl}footer/footer-image-2.png`,
      FOOTER3: `${bucketUrl}footer/footer-image-3.png`,
      FOOTER4: `${bucketUrl}footer/footer-image-4.png`,
      FOOTER5: `${bucketUrl}footer/footer-image-5.png`,
      FOOTER_BADGE: `${bucketUrl}footer/yellow-ribbon.png`,
      FOOTER_LINK2: externalApi?.websiteUrl,
      FOOTER_LINK3: externalApi?.websiteUrl,
      FOOTER_LINK4: 'https://console.metgo.app/',
      FACEBOOK_LINK: externalApi?.facebookUrl,
      WHATSAPP_LINK: externalApi?.whatsappNumber,
      FOOTER_BANNER: `${bucketUrl}footer/footer-banner.png`,
      FOOTER_BANNER_MOBILE: `${bucketUrl}footer/footer-banner-mobile.png`,
      FOOTER_LINK1: externalApi?.websiteUrl,
    },
  };
}
