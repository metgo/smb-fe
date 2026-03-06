// ./data/mockBusinesses.ts

export interface Business {
  id: string;
  name: string;
  logo: string;
  shortDescription: string;
  dmo: string; // Destination Management Organization
  authority: string; // e.g. regional authority / municipality
  categories: string[]; // business tags / types
}

export const mockBusinesses: Business[] = [
  {
    id: "biz-1",
    name: "Desert Lodge Hotel",
    logo: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
    shortDescription:
      "Luxury desert accommodation with stunning views of the Ramon Crater",
    dmo: "Visit Negev",
    authority: "Mitzpe Ramon",
    categories: ["Hotel", "Accommodation", "Luxury"],
  },
  {
    id: "biz-2",
    name: "Ramon Crater Restaurant",
    logo: "https://images.unsplash.com/photo-1517248135467-2c7ed3ab7229?w=400&h=300&fit=crop",
    shortDescription:
      "Fine dining with locally sourced ingredients and Negev-inspired cuisine",
    dmo: "Negev Tourism",
    authority: "Mitzpe Ramon",
    categories: ["Restaurant", "Fine Dining", "Local Cuisine"],
  },
  {
    id: "biz-3",
    name: "Negev Adventure Tours",
    logo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    shortDescription:
      "Jeep tours, hiking, and stargazing experiences in the Negev desert",
    dmo: "Explore North Negev",
    authority: "Yeruham",
    categories: ["Tours", "Adventure", "Nature"],
  },
  {
    id: "biz-4",
    name: "Be'er Sheva Wellness Spa",
    logo: "https://images.unsplash.com/photo-1544161513-0179b4ae2630?w=400&h=300&fit=crop",
    shortDescription:
      "Relaxing spa treatments and wellness programs in the heart of the Negev",
    dmo: "Visit Negev",
    authority: "Be'er Sheva",
    categories: ["Spa", "Wellness", "Relaxation"],
  },
  {
    id: "biz-5",
    name: "Sderot Artisan Market",
    logo: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=400&h=300&fit=crop",
    shortDescription:
      "Weekly market featuring handmade crafts, local produce and street food",
    dmo: "EshmalKol",
    authority: "Sderot",
    categories: ["Market", "Shopping", "Local Products"],
  },
  {
    id: "biz-6",
    name: "Yeruham Camel Ranch",
    logo: "https://images.unsplash.com/photo-1564760055098-2d3c8e5e0c5e?w=400&h=300&fit=crop",
    shortDescription:
      "Camel rides, Bedouin hospitality and desert camping experiences",
    dmo: "Explore North Negev",
    authority: "Yeruham",
    categories: ["Experience", "Camel Tours", "Cultural"],
  },
  {
    id: "biz-7",
    name: "Dimona Date Farm",
    logo: "https://images.unsplash.com/photo-1597843786411-a7fa8ed2f1c4?w=400&h=300&fit=crop",
    shortDescription:
      "Organic date plantation with tours, tasting and farm shop",
    dmo: "Negev Tourism",
    authority: "Dimona",
    categories: ["Agriculture", "Food", "Tour"],
  },
  {
    id: "biz-8",
    name: "Arad Pottery Studio",
    logo: "https://images.unsplash.com/photo-1570549717489-6b5e9c7b7e3d?w=400&h=300&fit=crop",
    shortDescription:
      "Handmade ceramics workshop and gallery in the desert town of Arad",
    dmo: "Visit Negev",
    authority: "Arad",
    categories: ["Art", "Workshop", "Shopping"],
  },
];

export function getRandomBusiness(): Business {
  return mockBusinesses[Math.floor(Math.random() * mockBusinesses.length)];
}
