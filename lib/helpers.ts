export function getBusinessList(
  length: number,
): { id: number; image: string }[] {
  // const imageUrl = "https://images.pexels.com/photos/2325447/pexels-photo-2325447.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500";
  const imageUrl =
    "https://images.pexels.com/photos/12961190/pexels-photo-12961190.jpeg";

  const business = Array.from({ length }, (_, i) => ({
    id: i + 1,
    image: imageUrl,
  }));

  return business;
}

// Function to scale layout dimensions based on screen width
export const scaleLayout = (
  layout: LayoutItem[],
  scale: number,
): LayoutItem[] => {
  return layout.map((item) => ({
    width: Math.round(item.width * scale),
    height: Math.round(item.height * scale),
  }));
};

export const handleCropImage = async (
  imageItem: ImageItem,
  aspect: number,
  setIsLoading: (isLoading: boolean) => void,
  setCroppedImageUrl: ({
    imageUrl,
    alt,
  }: {
    imageUrl: string;
    alt: string;
  }) => void,
) => {
  const encodedImageUrl = encodeURIComponent(imageItem?.image);
  const xMin = imageItem?.subCoordinates?.xMin || 0;
  const yMin = imageItem?.subCoordinates?.xMin || 0;
  const xMax = imageItem?.subCoordinates?.xMax || 0;
  const yMax = imageItem?.subCoordinates?.yMax || 0;

  if (!xMin && !yMin && !xMax && !yMax) {
    setCroppedImageUrl({ imageUrl: imageItem?.image, alt: imageItem?.alt });
    return;
  }

  const query = `url=${encodedImageUrl}&xMin=${xMin}&yMin=${yMin}&xMax=${xMax}&yMax=${yMax}&aspect=${aspect}`;
  setIsLoading(true);
  try {
    const res = await fetch(`/api/crop-image?${query}`);
    if (!res.ok) throw new Error("Failed to crop image");

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    setCroppedImageUrl({ imageUrl: objectUrl, alt: imageItem.alt });
  } catch (error) {
    console.error(`Error cropping image`, error);
  } finally {
    setIsLoading(false);
  }
};

export const handleCropImagedraft = async (
  imageItem: ImageItem,
  aspect: number,
  setIsLoading: (isLoading: boolean) => void,
  setCroppedImageUrl: (url: string) => void,
) => {
  if (imageItem?.subCoordinates) {
    const encodedImageUrl = encodeURIComponent(imageItem?.image);
    const { xMin, yMin, xMax, yMax } = imageItem?.subCoordinates;

    const query = `url=${encodedImageUrl}&xMin=${xMin}&yMin=${yMin}&xMax=${xMax}&yMax=${yMax}&aspect=${aspect}`;
    setIsLoading(false);
    try {
      const res = await fetch(`/api/crop-image?${query}`);
      if (!res.ok) throw new Error("Failed to crop image");

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setCroppedImageUrl(objectUrl);
    } catch (error) {
      console.error(`Error cropping image`, error);
    } finally {
      setIsLoading(false);
    }
  } else {
    setCroppedImageUrl(imageItem?.image || "/images/image-placeholder.jpg");
  }
};
