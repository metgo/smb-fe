// Mock data generator
export function generateMockProducts(): Product[] {
  const businesses = [
    { id: "biz-1", name: "Desert Lodge Hotel" },
    { id: "biz-2", name: "Ramon Crater Restaurant" },
    { id: "biz-3", name: "Negev Adventure Tours" },
    { id: "biz-4", name: "Be'er Sheva Wellness Spa" },
    { id: "biz-5", name: "Sderot Artisan Market" },
  ];
  console.log("🚀 ~ generateMockProducts ~ businesses:", businesses);

  const types: Product["productType"][] = [
    "PHYSICAL",
    "TABLE_ORDER",
    "SERVICE",
    "HOTEL",
    "EXPERIENCE",
  ];
  console.log("🚀 ~ generateMockProducts ~ types:", types);
  const statuses: Product["status"][] = ["draft", "inactive", "active"];
  console.log("🚀 ~ generateMockProducts ~ statuses:", statuses);

  const products: Product[] = [];

  for (let i = 1; i <= 50; i++) {
    const business = businesses[Math.floor(Math.random() * businesses.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const markedPrice = Math.floor(Math.random() * 500) + 100;
    const sellingPrice = markedPrice - Math.floor(Math.random() * 50);

    // products.push({
    //   id: `product-${i}`,
    //   name: {
    //     en: `Product ${i}`,
    //     he: `מוצר ${i}`,
    //     ar: `منتج ${i}`,
    //   },
    //   shortDescription: {
    //     en: `Amazing product for your needs`,
    //     he: `מוצר מדהים לצרכים שלך`,
    //     ar: `منتج مذهل لاحتياجاتك`,
    //   },
    //   businessId: business.id,
    //   businessName: business.name,
    //   type,
    //   status,
    //   markedPrice,
    //   sellingPrice,
    //   quantity:
    //     Math.random() > 0.3 ? Math.floor(Math.random() * 100) + 10 : null,
    //   soldCount: Math.floor(Math.random() * 30),
    //   availability: {
    //     startDate: null,
    //     endDate: null,
    //   },
    //   categories: ["Category A", "Category B"],
    //   image: null,
    //   lastUpdated: new Date(
    //     Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    //   ).toISOString(),
    //   languageCompleteness: {
    //     en: true,
    //     he: Math.random() > 0.3,
    //     ar: Math.random() > 0.5,
    //   },
    // });
  }

  return products;
}
