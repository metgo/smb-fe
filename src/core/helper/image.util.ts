export function sanitizeImages(images: any[]): any[] {
  if (!Array.isArray(images)) return images;

  const sanitizedImages = images
    .filter(img => img != null)
    .map(({ subCoordinates, caption, ...img }) => img);

  const primaryImage = sanitizedImages.find(img => img.isPrimary);
  const nonPrimaryImages = sanitizedImages.filter(img => !img.isPrimary);

  if (primaryImage) {
    return [primaryImage, ...nonPrimaryImages];
  }

  return sanitizedImages;
}
