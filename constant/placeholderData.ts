export const slides = [
  {
    id: 1,
    name: "Cozy Macaron Haven",
    desc: "A delightful spot for macaron lovers in the heart of the city...",
    imageUrl:
      "https://images.pexels.com/photos/12961190/pexels-photo-12961190.jpeg",
  },
  {
    id: 2,
    name: "Rustic Bakery Delight",
    desc: "Enjoy freshly baked goods in a charming rustic setting...",
    imageUrl:
      "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg",
  },
  {
    id: 3,
    name: "Urban Coffee Spot",
    desc: "A trendy cafe with the best coffee in the downtown area...",
    imageUrl:
      "https://images.pexels.com/photos/302893/pexels-photo-302893.jpeg",
  },
  {
    id: 4,
    name: "Seaside Pastry Shop",
    desc: "Indulge in pastries with a stunning ocean view...",
    imageUrl:
      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
  },
  {
    id: 5,
    name: "Mountain Chalet Cafe",
    desc: "Cozy up with desserts in a scenic mountain location...",
    imageUrl:
      "https://images.pexels.com/photos/1387037/pexels-photo-1387037.jpeg",
  },
  {
    id: 6,
    name: "מתוקים בנגב",
    desc: "גילי הקונדיטורית שפית מכינה לכם את מי...",
    imageUrl:
      "https://images.pexels.com/photos/848573/pexels-photo-848573.jpeg",
  },
];

export const foodSubCategories = [
  { id: 1, label: "מסעדות" }, // Restaurants
  { id: 2, label: "בתי קפה" }, // Cafés
  { id: 3, label: "מאפיות" }, // Bakeries
  { id: 4, label: "דוכני רחוב" }, // Street Food
  { id: 5, label: "גלידריות" }, // Ice Cream Shops
  { id: 6, label: "מסעדות טבעוניות" }, // Vegan Restaurants
  { id: 7, label: "מסעדות כשרות" }, // Kosher Restaurants
  { id: 8, label: "ברים ופאבים" }, // Bars & Pubs
  { id: 9, label: "מסעדות אסיאתיות" }, // Asian Restaurants
  { id: 10, label: "פוד טראקס" }, // Food Trucks
];

export const eventDetils = {
  title: "מסיבת קצב לילית בנגב",
  header: "פרטי האירוע",
  desc: `הכירו את מופע הלייזר הכי מהפנט בעיר הבירה. High LIGHT JLM מאגד לתוכו 3 מופעים שונים – סיפור של אור, סיפור של שלום וסיפור של תפילה נצחית להרמוניה, שמקפלים בתוכם שיר הלל של אור ומוזיקה, להיסטוריה, למרקם ולתרבות הירושלמית. בכל אחד מהמופעים נעשה שימוש בלייזרים רבים ברחבי העיר, שמופעלים באמצעות מערכת בקרה ייחודית, שתוכננה בהתאמה לדרישות אקולוגיות מוקפדות, היוצרות יחדיו אפקט מרהיב ועוצר נשימה, ללא זיהום אוויר ופגיעה בסביבה. את המופעים מלווה מוזיקה מקורית וסוחפת, שמעבירה ברגישות את סיפורה של ירושלים ותולדות העם היהודי. המוזיקה כוללת מוטיבים מתרבויות ומדתות שונות, לצד שירים יהודים מוכרים, שהפכו לנכס צאן ברזל. המיזוג הייחוד בין מזרח למערב וישן לחדש, יוצרת מופע שורשי ומודרני, שמבקש להעביר מסר לפיו בירושלים יש מקום לכולם, השלום תמיד שוכן בה והתפילה תמיד נשמעת.
המופע מוקדש לכוחות הביטחון וההצלה ומשפחות החטופים, בתקווה לימים טובים יותר.`,
  dateline: "*ההרשמה נסגרת ב10.6.25.",
};

export const eventDates = [
  {
    id: 1,
    title: "שבת",
    month: "יוני",
    day: "28",
    isActive: false,
  },
  {
    id: 2,
    title: "שישי",
    month: "יוני",
    day: "27",
    isActive: true,
  },
  {
    id: 3,
    title: "חמישי",
    month: "יוני",
    day: "26",
    isActive: false,
  },
  {
    id: 4,
    title: "רביעי",
    month: "יוני",
    day: "25",
    isActive: false,
  },
];

export const products: ProductProps[] = [
  {
    _id: 1,
    name: "Eco Bamboo Toothbrush",
    desc: "Sustainable and biodegradable bamboo toothbrush for a clean smile.",
    price: "$4.99",
    images: [
      {
        image:
          "https://images.pexels.com/photos/3735206/pexels-photo-3735206.jpeg",
        caption: "Top view of bamboo toothbrush",
        alt: "Eco bamboo toothbrush",
      },
      {
        image:
          "https://images.pexels.com/photos/3735211/pexels-photo-3735211.jpeg",
        caption: "Toothbrush in eco packaging",
        alt: "Eco toothbrush in box",
      },
      {
        image:
          "https://images.pexels.com/photos/3735212/pexels-photo-3735212.jpeg",
        caption: "Toothbrush bristles close-up",
        alt: "Bristles of bamboo toothbrush",
      },
      {
        image:
          "https://images.pexels.com/photos/3735213/pexels-photo-3735213.jpeg",
        caption: "Set of eco brushes",
        alt: "Multiple eco-friendly toothbrushes",
      },
    ],
  },
  {
    _id: 2,
    name: "Reusable Water Bottle",
    desc: "Stainless steel insulated bottle to keep drinks hot or cold.",
    price: "$19.99",
    images: [
      {
        image:
          "https://images.pexels.com/photos/267669/pexels-photo-267669.jpeg",
        caption: "Stainless bottle on rock",
        alt: "Reusable water bottle",
      },
      {
        image:
          "https://images.pexels.com/photos/1556704/pexels-photo-1556704.jpeg",
        caption: "Bottle in backpack pocket",
        alt: "Bottle with hiker gear",
      },
      {
        image:
          "https://images.pexels.com/photos/3757420/pexels-photo-3757420.jpeg",
        caption: "Hydration in nature",
        alt: "Water bottle in wild",
      },
      {
        image:
          "https://images.pexels.com/photos/1235691/pexels-photo-1235691.jpeg",
        caption: "Bottles lined up",
        alt: "Multiple reusable bottles",
      },
    ],
  },
  {
    _id: 3,
    name: "Minimalist Wooden Clock",
    desc: "A simple, elegant wooden clock for any room décor.",
    price: "$29.00",
    images: [
      {
        image:
          "https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg",
        caption: "Wooden clock close-up",
        alt: "Minimal wooden clock",
      },
      {
        image:
          "https://images.pexels.com/photos/210581/pexels-photo-210581.jpeg",
        caption: "Clock on wooden table",
        alt: "Modern wooden clock decor",
      },
      {
        image:
          "https://images.pexels.com/photos/105008/pexels-photo-105008.jpeg",
        caption: "Clock in living room",
        alt: "Wall clock interior design",
      },
      {
        image:
          "https://images.pexels.com/photos/3965542/pexels-photo-3965542.jpeg",
        caption: "Detail of clock face",
        alt: "Clock face minimal style",
      },
    ],
  },
  // 🛒 Repeat and vary similarly for next 22 items:
  ...Array.from({ length: 22 }, (_, i) => ({
    _id: i + 4,
    name: `Product ${i + 4}`,
    desc: `This is a description for product ${i + 4}. It’s a great item for modern lifestyle.`,
    price: `$${(Math.random() * 100 + 10).toFixed(2)}`,
    images: [
      {
        image: `https://images.pexels.com/photos/103${i + 1}8/pexels-photo-103${i + 1}8.jpeg`,
        caption: `Main view of product ${i + 4}`,
        alt: `Main image of product ${i + 4}`,
      },
      {
        image: `https://images.pexels.com/photos/103${i + 1}9/pexels-photo-103${i + 1}9.jpeg`,
        caption: `Side view of product ${i + 4}`,
        alt: `Side image of product ${i + 4}`,
      },
      {
        image: `https://images.pexels.com/photos/103${i + 2}0/pexels-photo-103${i + 2}0.jpeg`,
        caption: `Detail of product ${i + 4}`,
        alt: `Close-up image of product ${i + 4}`,
      },
      {
        image: `https://images.pexels.com/photos/103${i + 2}1/pexels-photo-103${i + 2}1.jpeg`,
        caption: `Lifestyle shot of product ${i + 4}`,
        alt: `In-use image of product ${i + 4}`,
      },
    ],
  })),
];
