// Mock data
export const websites = ["Website 1", "Website 2", "Website 3"];
export const mockProducts = [
  {
    id: "1",
    name: "Spa Package",
    price: 150,
    businessName: "Luxury Spa",
    category: "Wellness",
    image: "",
    accessibility: ["wheelchair", "parking"],
  },
  {
    id: "2",
    name: "Desert Tour",
    price: 200,
    businessName: "Adventure Co",
    category: "Tours",
    image: "",
    accessibility: ["wheelchair"],
  },
  {
    id: "3",
    name: "Hotel Room",
    price: 300,
    businessName: "Beach Hotel",
    category: "Accommodation",
    image: "",
    accessibility: ["wheelchair", "parking", "elevator"],
  },
  {
    id: "4",
    name: "Dining Experience",
    price: 120,
    businessName: "Fine Restaurant",
    category: "Dining",
    image: "",
    accessibility: ["parking"],
  },
];

export const generateMockOrders = (count: number): any[] => {
  const statuses: any["status"][] = [
    "draft",
    "processing",
    "paid",
    "confirmed",
    "delivered",
    "completed",
    "canceled",
    "partially_cancelled",
    "failed",
  ];
  // const paymentStatuses: IOrder["paymentStatus"][] = [
  //   "pending",
  //   "success",
  //   "failed",
  //   "refunded",
  //   "partially_refunded",
  // ];
  const deliveryTypes: IOrder["deliveryType"][] = [
    "pickup",
    "delivery",
    "digital",
  ];
  const vendors = [
    "Beersheba Bistro",
    "Desert Delight",
    "Negev Tours",
    "Arad Adventures",
    "Mitzpe Ramon Resort",
  ];
  const campaigns = [
    "Summer Sale 2026",
    "Desert Discovery",
    "Family Fun Days",
    "Food Festival",
    "Adventure Week",
  ];

  const products = [
    {
      name: "Guided Desert Tour",
      price: 120,
      imageUrl: "https://via.placeholder.com/150",
      description: "Explore the desert with a professional guide.",
      category: "Tour",
    },
    {
      name: "Sunset Jeep Ride",
      price: 95,
      imageUrl: "https://via.placeholder.com/150",
      description: "Experience the sunset in a Jeep.",
      category: "Activity",
    },
    {
      name: "Bedouin Dinner Experience",
      price: 75,
      imageUrl: "https://via.placeholder.com/150",
      description: "Enjoy a traditional Bedouin dinner.",
      category: "Dinner",
    },
    {
      name: "Hotel Night Package",
      price: 180,
      imageUrl: "https://via.placeholder.com/150",
      description: "Stay overnight in a luxurious hotel.",
      category: "Accommodation",
    },
    {
      name: "Makhtesh Ramon Hike",
      price: 60,
      imageUrl: "https://via.placeholder.com/150",
      description: "Hike through the Makhtesh Ramon.",
      category: "Hike",
    },
    {
      name: "Wine Tasting Tour",
      price: 85,
      imageUrl: "https://via.placeholder.com/150",
      description: "Sample local wines on a guided tour.",
      category: "Tour",
    },
    {
      name: "Pottery Workshop",
      price: 45,
      imageUrl: "https://via.placeholder.com/150",
      description: "Create pottery pieces in a hands-on workshop.",
      category: "Workshop",
    },
  ];

  return Array.from({ length: count }, (_, i) => {
    const orderProducts: any[] = Array.from(
      { length: Math.floor(Math.random() * 3) + 1 },
      (_, j) => {
        const product = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 3) + 1;
        return {
          id: `prod-${i}-${j}`,
          name: product.name,
          quantity: qty,
          unitPrice: product.price,
          vendor: vendors[Math.floor(Math.random() * vendors.length)],
          deliveryType: Math.random() > 0.5 ? "pickup" : "delivery",
          imageUrl: product.imageUrl,
          description: product.description,
          category: product.category,
        };
      },
    );

    const totalAmount = orderProducts.reduce(
      (sum, p) => sum + p.quantity * p.unitPrice,
      0,
    );
    const voucherPortion =
      Math.random() > 0.3 ? Math.floor(totalAmount * (Math.random() * 0.5)) : 0;
    const deliveryFee = orderProducts.some((p) => p.deliveryType === "delivery")
      ? 15
      : 0;

    return {
      id: `ORD-${String(10000 + i).padStart(5, "0")}`,
      purchaserName: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      phone: `+972-50-${String(Math.floor(Math.random() * 10000000)).padStart(7, "0")}`,
      orderType: Math.random() > 0.5 ? "online" : "offline",
      orderStatus: statuses[Math.floor(Math.random() * statuses.length)],
      // paymentStatus:
      //   paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      paymentMethod:
        voucherPortion > 0 ? ["voucher", "credit_card"] : ["credit_card"],
      totalAmount: totalAmount + deliveryFee,
      voucherAmount: voucherPortion,
      creditCardAmount: totalAmount - voucherPortion,
      vendors: [...new Set(orderProducts.map((p) => p.vendor))],
      campaign: campaigns[Math.floor(Math.random() * campaigns.length)],
      deliveryType:
        deliveryTypes[Math.floor(Math.random() * deliveryTypes.length)],
      createdDate: new Date(
        2026,
        0,
        Math.floor(Math.random() * 30) + 1,
      ).toISOString(),
      paymentDate: new Date(
        2026,
        0,
        Math.floor(Math.random() * 30) + 1,
      ).toISOString(),
      products: orderProducts,
      address: Math.random() > 0.5 ? "123 Main St, Beersheba" : undefined,
      campaignCode: `CAMP${Math.floor(Math.random() * 1000)}`,
      qrScanned: Math.random() > 0.5,
      deliveryFee,
    };
  });
};

// Mock products for selection
export const availableProducts = [
  // Experiences
  {
    id: "P001",
    name: "Desert Safari Experience",
    vendor: "Desert Tours Ltd",
    category: "Experience",
    price: 450,
  },
  {
    id: "P002",
    name: "Stargazing Night Tour",
    vendor: "Desert Tours Ltd",
    category: "Experience",
    price: 280,
  },
  {
    id: "P003",
    name: "Local Cuisine Workshop",
    vendor: "Culinary Negev",
    category: "Experience",
    price: 220,
  },
  {
    id: "P004",
    name: "Bedouin Cultural Experience",
    vendor: "Heritage Tours",
    category: "Experience",
    price: 320,
  },
  {
    id: "P005",
    name: "Ceramic Workshop",
    vendor: "Negev Arts",
    category: "Experience",
    price: 180,
  },
  {
    id: "P006",
    name: "Wine Tasting Tour",
    vendor: "Negev Wineries",
    category: "Experience",
    price: 295,
  },
  {
    id: "P007",
    name: "Photography Safari",
    vendor: "Lens & Desert",
    category: "Experience",
    price: 380,
  },
  {
    id: "P008",
    name: "Sunset Camel Ride",
    vendor: "Desert Adventures",
    category: "Experience",
    price: 240,
  },

  // Accommodations
  {
    id: "P009",
    name: "Boutique Hotel Room",
    vendor: "Negev Inn",
    category: "Accommodation",
    price: 680,
  },
  {
    id: "P010",
    name: "Desert Lodge Suite",
    vendor: "Negev Inn",
    category: "Accommodation",
    price: 920,
  },
  {
    id: "P011",
    name: "Eco-Cabin Experience",
    vendor: "Green Desert Retreats",
    category: "Accommodation",
    price: 540,
  },
  {
    id: "P012",
    name: "Luxury Glamping Tent",
    vendor: "Negev Under Stars",
    category: "Accommodation",
    price: 750,
  },
  {
    id: "P013",
    name: "Family Suite Package",
    vendor: "Oasis Hotel",
    category: "Accommodation",
    price: 1150,
  },

  // Tours & Activities
  {
    id: "P014",
    name: "Hiking Guide Service",
    vendor: "Trail Masters",
    category: "Service",
    price: 350,
  },
  {
    id: "P015",
    name: "Off-Road Jeep Tour",
    vendor: "Desert Adventures",
    category: "Tour",
    price: 420,
  },
  {
    id: "P016",
    name: "Archaeological Site Tour",
    vendor: "Heritage Tours",
    category: "Tour",
    price: 260,
  },
  {
    id: "P017",
    name: "Mountain Biking Adventure",
    vendor: "Trail Masters",
    category: "Activity",
    price: 310,
  },
  {
    id: "P018",
    name: "Rock Climbing Session",
    vendor: "Summit Negev",
    category: "Activity",
    price: 275,
  },

  // Food & Dining
  {
    id: "P019",
    name: "Traditional Dinner Experience",
    vendor: "Culinary Negev",
    category: "Dining",
    price: 185,
  },
  {
    id: "P020",
    name: "Farm-to-Table Breakfast",
    vendor: "Green Desert Retreats",
    category: "Dining",
    price: 95,
  },
  {
    id: "P021",
    name: "Gourmet Picnic Package",
    vendor: "Oasis Catering",
    category: "Dining",
    price: 145,
  },

  // Wellness & Spa
  {
    id: "P022",
    name: "Desert Spa Package",
    vendor: "Serenity Spa Negev",
    category: "Wellness",
    price: 480,
  },
  {
    id: "P023",
    name: "Yoga Retreat Day",
    vendor: "Mindful Desert",
    category: "Wellness",
    price: 225,
  },
  {
    id: "P024",
    name: "Massage & Hot Springs",
    vendor: "Serenity Spa Negev",
    category: "Wellness",
    price: 340,
  },

  // Workshops & Classes
  {
    id: "P025",
    name: "Weaving Workshop",
    vendor: "Negev Arts",
    category: "Workshop",
    price: 160,
  },
  {
    id: "P026",
    name: "Bread Baking Class",
    vendor: "Culinary Negev",
    category: "Workshop",
    price: 120,
  },
  {
    id: "P027",
    name: "Calligraphy Workshop",
    vendor: "Heritage Arts Center",
    category: "Workshop",
    price: 140,
  },

  // Special Packages
  {
    id: "P028",
    name: "Weekend Explorer Package",
    vendor: "Desert Tours Ltd",
    category: "Package",
    price: 1450,
  },
  {
    id: "P029",
    name: "Romantic Getaway Bundle",
    vendor: "Negev Romance",
    category: "Package",
    price: 1680,
  },
  {
    id: "P030",
    name: "Adventure Seeker Pass",
    vendor: "Desert Adventures",
    category: "Package",
    price: 890,
  },
];
