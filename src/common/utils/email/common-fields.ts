export function getCommonEmailFields(identifierId: string, theme) {
  const bucketName = identifierId.toLowerCase().replace(/[^a-z0-9._-]/g, '');

  const bucketUrl = `https://storage.googleapis.com/${bucketName}/emails/`;

  return {
    bucketUrl,
    emailFields: {
      COLOR: theme?.primaryColor,
      LOGO: `${bucketUrl}header/company-logo.png`,
      FOOTER1: `${bucketUrl}footer/footer-image-1.png`,
      FOOTER2: `${bucketUrl}footer/footer-image-2.png`,
      FOOTER3: `${bucketUrl}footer/footer-image-3.png`,
      FOOTER4: `${bucketUrl}footer/footer-image-4.png`,
      FOOTER_LINK2: theme?.websiteUrl,
      FOOTER_LINK3: theme?.websiteUrl,
      FOOTER_LINK4: 'https://console.metgo.app/',
      FACEBOOK_LINK: theme?.faceBookUrl,
      WHATSAPP_LINK: theme?.whatsappNo,
    },
  };
}
