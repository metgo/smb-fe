

export function getBusinessList(length: number): { id: number; image: string }[] {
  const imageUrl = "https://images.pexels.com/photos/2325447/pexels-photo-2325447.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500";

  const business = Array.from({ length }, (_, i) => ({
    id: i + 1,
    image: imageUrl,
  }));

  return business;
}