export const mockBusinesses: Business[] = [
  {
    id: 'bus-001',
    name: 'Desert Bloom Cafe',
    shortDescription: 'A cozy cafe offering authentic Middle Eastern cuisine and specialty coffee',
    fullDescription: 'Desert Bloom Cafe is a family-owned establishment that has been serving the community for over 15 years. We specialize in traditional Middle Eastern dishes prepared with locally sourced ingredients, complemented by our award-winning coffee selection.',
    email: 'info@desertbloom.co.il',
    phone: '+972-8-6231234',
    website: 'https://desertbloom.co.il',
    logo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&h=200&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop',
    ],
    status: 'approved',
    authority: 'Eshkol Regional Council',
    dmo: 'Western Negev Tourism',
    categories: ['Food & Dining', 'Cafe'],
    subcategories: ['Middle Eastern Cuisine', 'Coffee Shop'],
    tags: ['Kosher', 'Family Friendly', 'Outdoor Seating', 'WiFi'],
    impactScore: 685,
    productsCount: 12,
    lifetimeSales: 150000,
    address: 'HaShalom St 45, Ofakim',
    coordinates: { lat: 31.3158, lng: 34.6203 },
    contactPerson: {
      name: 'Sarah Cohen',
      email: 'sarah@desertbloom.co.il',
      phone: '+972-50-1234567',
    },
    operatingHours: {
      sunday: [{ open: '08:00', close: '22:00' }],
      monday: [{ open: '08:00', close: '22:00' }],
      tuesday: [{ open: '08:00', close: '22:00' }],
      wednesday: [{ open: '08:00', close: '22:00' }],
      thursday: [{ open: '08:00', close: '23:00' }],
      friday: [{ open: '08:00', close: '15:00' }],
      saturday: [{ open: '20:00', close: '23:00' }],
    },
    accessibility: ['Wheelchair Accessible', 'Accessible Parking'],
    groupTypes: ['Families', 'Couples', 'Groups'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-12-20T14:22:00Z',
    completionPercentage: 100,
    analytics: {
      pageViews: 1500,
      uniqueVisitors: 500,
      clicks: 300,
      bookmarks: 50,
      shares: 20,
      averageTimeOnPage: 120,
      conversionRate: 15,
    },
    socialMedia: {
      facebook: 'https://facebook.com/desertbloomcafe',
      instagram: 'https://instagram.com/desertbloomcafe',
      youtube: 'https://youtube.com/desertbloomcafe',
      tiktok: 'https://tiktok.com/desertbloomcafe',
    },
    deliveryAdditionalInfo: 'Delivery to all of Israel - 20 ILS. Pick-up available from our Ofakim location or other locations in Eshkol Regional Council by arrangement.',
    deliveryReturnExchange: [
      'Items from the order can only be returned or exchanged once, in coordination with the business',
      'Customers are responsible for returning the product directly to the business',
    ],
    deliverySpecificSellerInfo: [
      'Products ship within 1-3 business days',
      'Contactless delivery available upon request',
    ],
  },
  {
    id: 'bus-002',
    name: 'Negev Adventure Tours',
    shortDescription: 'Experience the magic of the Negev desert with our guided jeep and hiking tours',
    fullDescription: 'Negev Adventure Tours offers unforgettable experiences in the stunning landscapes of the Western Negev. Our experienced guides lead small groups through ancient riverbeds, spectacular craters, and hidden desert oases. We specialize in customized tours for all fitness levels.',
    email: 'tours@negevadventure.com',
    phone: '+972-8-6445566',
    website: 'https://negevadventure.com',
    logo: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=200&h=200&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop',
    ],
    status: 'approved',
    authority: 'Ramat Negev Regional Council',
    dmo: 'Western Negev Tourism',
    categories: ['Tourism', 'Adventure'],
    subcategories: ['Jeep Tours', 'Hiking', 'Nature Tours'],
    tags: ['Desert', 'Outdoor', 'Photography', 'Family Activities'],
    impactScore: 742,
    productsCount: 8,
    lifetimeSales: 200000,
    address: 'Kibbutz Revivim, Western Negev',
    coordinates: { lat: 31.0892, lng: 34.7031 },
    contactPerson: {
      name: 'David Levi',
      email: 'david@negevadventure.com',
      phone: '+972-52-9876543',
    },
    operatingHours: {
      sunday: [{ open: '06:00', close: '18:00' }],
      monday: [{ open: '06:00', close: '18:00' }],
      tuesday: [{ open: '06:00', close: '18:00' }],
      wednesday: [{ open: '06:00', close: '18:00' }],
      thursday: [{ open: '06:00', close: '18:00' }],
      friday: [{ open: '06:00', close: '14:00' }],
      saturday: [],
    },
    accessibility: ['Moderate Fitness Required'],
    groupTypes: ['Families', 'Groups', 'Corporate'],
    createdAt: '2024-02-10T09:15:00Z',
    updatedAt: '2024-12-18T11:45:00Z',
    completionPercentage: 95,
    analytics: {
      pageViews: 2000,
      uniqueVisitors: 600,
      clicks: 400,
      bookmarks: 60,
      shares: 25,
      averageTimeOnPage: 150,
      conversionRate: 20,
    },
    socialMedia: {
      facebook: 'https://facebook.com/negevadventuretours',
      instagram: 'https://instagram.com/negevadventuretours',
      youtube: 'https://youtube.com/negevadventuretours',
      tiktok: 'https://tiktok.com/negevadventuretours',
    },
  },
  {
    id: 'bus-003',
    name: 'Sderot Artisan Market',
    shortDescription: 'Local crafts, fresh produce, and handmade goods from Western Negev artisans',
    fullDescription: 'The Sderot Artisan Market brings together talented local craftspeople, farmers, and food producers. Every Friday, our bustling market features over 50 vendors selling everything from organic vegetables to handcrafted jewelry, traditional textiles, and gourmet treats.',
    email: 'market@sderotartisan.co.il',
    phone: '+972-8-6123456',
    website: 'https://sderotartisan.co.il',
    logo: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=200&h=200&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1524838794612-0e29d4049d59?w=800&h=600&fit=crop',
    ],
    status: 'approved',
    authority: 'Sderot Municipality',
    dmo: 'Western Negev Tourism',
    categories: ['Shopping', 'Culture'],
    subcategories: ['Market', 'Arts & Crafts', 'Local Products'],
    tags: ['Handmade', 'Local', 'Organic', 'Weekly Event'],
    impactScore: 598,
    productsCount: 156,
    lifetimeSales: 180000,
    address: 'Yerushalayim Ave, Sderot',
    coordinates: { lat: 31.5244, lng: 34.5951 },
    contactPerson: {
      name: 'Rachel Mizrahi',
      email: 'rachel@sderotartisan.co.il',
      phone: '+972-54-3456789',
    },
    operatingHours: {
      sunday: [],
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [{ open: '09:00', close: '14:00' }],
      saturday: [],
    },
    accessibility: ['Wheelchair Accessible', 'Accessible Parking', 'Accessible Restrooms'],
    groupTypes: ['Families', 'Individuals', 'Seniors'],
    createdAt: '2024-03-05T12:00:00Z',
    updatedAt: '2024-12-22T09:30:00Z',
    completionPercentage: 88,
    analytics: {
      pageViews: 1800,
      uniqueVisitors: 550,
      clicks: 350,
      bookmarks: 45,
      shares: 15,
      averageTimeOnPage: 130,
      conversionRate: 18,
    },
    socialMedia: {
      facebook: 'https://facebook.com/sderotartisanmarket',
      instagram: 'https://instagram.com/sderotartisanmarket',
      youtube: 'https://youtube.com/sderotartisanmarket',
      tiktok: 'https://tiktok.com/sderotartisanmarket',
    },
    deliveryAdditionalInfo: 'Products are available for self-collection from the market on Fridays between 9:00-14:00. Some vendors offer individual delivery services.',
    deliveryReturnExchange: [
      'Returns are accepted within 14 days of delivery with original packaging',
      'Exchange only policy - no refunds',
    ],
    deliverySpecificSellerInfo: [
      'Products are available for self-collection from the business location only',
      'Shipping is not included in the price and will be arranged separately with the business after purchase',
    ],
  },
  {
    id: 'bus-004',
    name: 'Halutza Eco Lodge',
    shortDescription: 'Sustainable desert accommodation with stargazing and eco-tourism activities',
    fullDescription: 'Halutza Eco Lodge offers a unique off-grid experience in the heart of the Negev desert. Our solar-powered cabins provide comfortable accommodation while maintaining minimal environmental impact. Guests can enjoy guided stargazing sessions, desert meditation, and traditional Bedouin hospitality.',
    email: 'stay@halutzalodge.com',
    phone: '+972-8-6567890',
    website: 'https://halutzalodge.com',
    logo: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=200&h=200&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
    ],
    status: 'pending',
    authority: 'Eshkol Regional Council',
    dmo: 'Western Negev Tourism',
    categories: ['Accommodation', 'Eco-Tourism'],
    subcategories: ['Lodge', 'Sustainable Tourism', 'Desert Experience'],
    tags: ['Eco-Friendly', 'Stargazing', 'Off-Grid', 'Romantic'],
    impactScore: 721,
    productsCount: 4,
    lifetimeSales: 50000,
    address: 'Halutza Sands, Western Negev',
    coordinates: { lat: 31.2456, lng: 34.5234 },
    contactPerson: {
      name: 'Michael Green',
      email: 'michael@halutzalodge.com',
      phone: '+972-50-7654321',
    },
    operatingHours: {
      sunday: [{ open: '00:00', close: '23:59' }],
      monday: [{ open: '00:00', close: '23:59' }],
      tuesday: [{ open: '00:00', close: '23:59' }],
      wednesday: [{ open: '00:00', close: '23:59' }],
      thursday: [{ open: '00:00', close: '23:59' }],
      friday: [{ open: '00:00', close: '23:59' }],
      saturday: [{ open: '00:00', close: '23:59' }],
    },
    accessibility: ['Limited Accessibility'],
    groupTypes: ['Couples', 'Small Groups', 'Solo Travelers'],
    createdAt: '2024-11-20T15:30:00Z',
    updatedAt: '2024-12-15T10:20:00Z',
    completionPercentage: 75,
    analytics: {
      pageViews: 1200,
      uniqueVisitors: 400,
      clicks: 250,
      bookmarks: 30,
      shares: 10,
      averageTimeOnPage: 100,
      conversionRate: 10,
    },
    socialMedia: {
      facebook: 'https://facebook.com/halutzalodge',
      instagram: 'https://instagram.com/halutzalodge',
      youtube: 'https://youtube.com/halutzalodge',
      tiktok: 'https://tiktok.com/halutzalodge',
    },
  },
  {
    id: 'bus-005',
    name: 'Netivot Spice Bazaar',
    shortDescription: 'Traditional spice market with exotic flavors from across the Middle East and North Africa',
    fullDescription: 'For three generations, the Netivot Spice Bazaar has been the go-to destination for authentic spices, herbs, and traditional remedies. Our expert staff can guide you through hundreds of varieties and create custom spice blends for any dish.',
    email: 'info@netivotspice.co.il',
    phone: '+972-8-9934455',
    website: 'https://netivotspice.co.il',
    logo: 'https://images.unsplash.com/photo-1596040033229-a0b0e7c7e5c2?w=200&h=200&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1596040033229-a0b0e7c7e5c2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506617420156-8e4536971650?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1599909155424-2289a6ba5e3f?w=800&h=600&fit=crop',
    ],
    status: 'approved',
    authority: 'Netivot Municipality',
    dmo: 'Western Negev Tourism',
    categories: ['Shopping', 'Food & Dining'],
    subcategories: ['Specialty Food', 'Traditional Market'],
    tags: ['Spices', 'Traditional', 'Gourmet', 'Cultural'],
    impactScore: 563,
    productsCount: 245,
    lifetimeSales: 250000,
    address: 'HaRav Yitzhak Nissim St 12, Netivot',
    coordinates: { lat: 31.4189, lng: 34.5964 },
    contactPerson: {
      name: 'Yossi Dahan',
      email: 'yossi@netivotspice.co.il',
      phone: '+972-52-1239876',
    },
    operatingHours: {
      sunday: [{ open: '08:00', close: '19:00' }],
      monday: [{ open: '08:00', close: '19:00' }],
      tuesday: [{ open: '08:00', close: '19:00' }],
      wednesday: [{ open: '08:00', close: '19:00' }],
      thursday: [{ open: '08:00', close: '20:00' }],
      friday: [{ open: '08:00', close: '14:00' }],
      saturday: [],
    },
    accessibility: ['Wheelchair Accessible'],
    groupTypes: ['Individuals', 'Families', 'Food Enthusiasts'],
    createdAt: '2024-01-08T08:45:00Z',
    updatedAt: '2024-12-19T16:10:00Z',
    completionPercentage: 92,
    analytics: {
      pageViews: 1600,
      uniqueVisitors: 500,
      clicks: 300,
      bookmarks: 40,
      shares: 20,
      averageTimeOnPage: 110,
      conversionRate: 14,
    },
    socialMedia: {
      facebook: 'https://facebook.com/netivotspicebazaar',
      instagram: 'https://instagram.com/netivotspicebazaar',
      youtube: 'https://youtube.com/netivotspicebazaar',
      tiktok: 'https://tiktok.com/netivotspicebazaar',
    },
  },
  {
    id: 'bus-006',
    name: 'Be\'er Sheva Ceramic Studio',
    shortDescription: 'Pottery workshops and handcrafted ceramics inspired by desert landscapes',
    fullDescription: 'Our ceramic studio offers hands-on pottery workshops for all skill levels, from beginners to advanced ceramicists. We also showcase and sell unique handcrafted pieces created by local artists, each piece reflecting the colors and textures of the Negev desert.',
    email: 'studio@beershevacer amics.com',
    phone: '+972-8-6278899',
    website: 'https://beershevaceramics.com',
    logo: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=200&h=200&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&h=600&fit=crop',
    ],
    status: 'draft',
    authority: 'Be\'er Sheva Municipality',
    dmo: 'Western Negev Tourism',
    categories: ['Culture', 'Workshops'],
    subcategories: ['Art Studio', 'Craft Workshops', 'Pottery'],
    tags: ['Handmade', 'Art', 'Workshops', 'Souvenirs'],
    impactScore: 438,
    productsCount: 0,
    lifetimeSales: 0,
    address: 'Rager Blvd 78, Be\'er Sheva',
    coordinates: { lat: 31.2518, lng: 34.7913 },
    contactPerson: {
      name: 'Tamar Shapira',
      email: 'tamar@beershevaceramics.com',
      phone: '+972-54-9988776',
    },
    operatingHours: {
      sunday: [{ open: '10:00', close: '18:00' }],
      monday: [{ open: '10:00', close: '18:00' }],
      tuesday: [{ open: '10:00', close: '18:00' }],
      wednesday: [{ open: '10:00', close: '18:00' }],
      thursday: [{ open: '10:00', close: '20:00' }],
      friday: [],
      saturday: [],
    },
    accessibility: ['Wheelchair Accessible', 'Accessible Restrooms'],
    groupTypes: ['Individuals', 'Families', 'Groups', 'Corporate Teams'],
    createdAt: '2024-12-01T11:00:00Z',
    updatedAt: '2024-12-15T14:30:00Z',
    completionPercentage: 45,
    internalNotes: 'New business - still setting up product listings',
    analytics: {
      pageViews: 800,
      uniqueVisitors: 300,
      clicks: 150,
      bookmarks: 20,
      shares: 5,
      averageTimeOnPage: 90,
      conversionRate: 5,
    },
    socialMedia: {
      facebook: 'https://facebook.com/beershevaceramics',
      instagram: 'https://instagram.com/beershevaceramics',
      youtube: 'https://youtube.com/beershevaceramics',
      tiktok: 'https://tiktok.com/beershevaceramics',
    },
  },
];

// Generate additional businesses to simulate hundreds of thousands
export function generateMockBusinesses(count: number = 100): Business[] {
  const businessTypes = [
    { type: 'Restaurant', category: 'Food & Dining', icon: 'restaurant' },
    { type: 'Hotel', category: 'Accommodation', icon: 'hotel' },
    { type: 'Shop', category: 'Shopping', icon: 'shopping' },
    { type: 'Tour', category: 'Tourism', icon: 'tour' },
    { type: 'Museum', category: 'Culture', icon: 'museum' },
    { type: 'Winery', category: 'Food & Dining', icon: 'winery' },
  ];

  const authorities = [
    'Eshkol Regional Council',
    'Ramat Negev Regional Council',
    'Sderot Municipality',
    'Netivot Municipality',
    'Be\'er Sheva Municipality',
    'Sha\'ar HaNegev Regional Council',
  ];

  const statuses: Business['status'][] = ['draft', 'pending', 'approved', 'rejected', 'archived'];

  const generated: Business[] = [];

  for (let i = 0; i < count; i++) {
    const typeIndex = i % businessTypes.length;
    const type = businessTypes[typeIndex];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const productsCount = status === 'approved' ? Math.floor(Math.random() * 50) : Math.floor(Math.random() * 10);

    generated.push({
      id: `bus-${String(i + 7).padStart(3, '0')}`,
      name: `${type.type} ${i + 1}`,
      shortDescription: `A wonderful ${type.type.toLowerCase()} in the Western Negev`,
      fullDescription: `This is a detailed description of ${type.type} ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      email: `contact${i + 1}@business.co.il`,
      phone: `+972-8-${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
      website: `https://business${i + 1}.co.il`,
      logo: `https://images.unsplash.com/photo-${1500000000000 + i}?w=200&h=200&fit=crop`,
      images: [
        `https://images.unsplash.com/photo-${1500000000000 + i}?w=800&h=600&fit=crop`,
        `https://images.unsplash.com/photo-${1500000000000 + i + 100}?w=800&h=600&fit=crop`,
      ],
      status,
      authority: authorities[i % authorities.length],
      dmo: 'Western Negev Tourism',
      categories: [type.category],
      subcategories: [type.type],
      tags: ['Local', 'Quality'],
      impactScore: Math.floor(Math.random() * 601) + 200, // Range: 200-800
      productsCount,
      lifetimeSales: Math.floor(Math.random() * 500000) + 50000, // Range: 50000-550000
      address: `Street ${i + 1}, City ${(i % 6) + 1}`,
      coordinates: {
        lat: 31.2 + (Math.random() * 0.4),
        lng: 34.5 + (Math.random() * 0.4),
      },
      contactPerson: {
        name: `Contact Person ${i + 1}`,
        email: `person${i + 1}@business.co.il`,
        phone: `+972-50-${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
      },
      operatingHours: {
        sunday: [{ open: '09:00', close: '18:00' }],
        monday: [{ open: '09:00', close: '18:00' }],
        tuesday: [{ open: '09:00', close: '18:00' }],
        wednesday: [{ open: '09:00', close: '18:00' }],
        thursday: [{ open: '09:00', close: '18:00' }],
        friday: [{ open: '09:00', close: '14:00' }],
        saturday: [],
      },
      accessibility: ['Wheelchair Accessible'],
      groupTypes: ['Families', 'Groups'],
      createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
      updatedAt: new Date(2024, 11, Math.floor(Math.random() * 24) + 1).toISOString(),
      completionPercentage: Math.floor(Math.random() * 40) + 60,
      analytics: {
        pageViews: Math.floor(Math.random() * 2000) + 500,
        uniqueVisitors: Math.floor(Math.random() * 1000) + 200,
        clicks: Math.floor(Math.random() * 500) + 100,
        bookmarks: Math.floor(Math.random() * 100) + 20,
        shares: Math.floor(Math.random() * 50) + 5,
        averageTimeOnPage: Math.floor(Math.random() * 100) + 50,
        conversionRate: Math.floor(Math.random() * 20) + 5,
      },
      socialMedia: {
        facebook: `https://facebook.com/business${i + 1}`,
        instagram: `https://instagram.com/business${i + 1}`,
        youtube: `https://youtube.com/business${i + 1}`,
        tiktok: `https://tiktok.com/business${i + 1}`,
      },
    });
  }

  return [...mockBusinesses, ...generated];
}










// Mock data
export const websites = ['Website 1', 'Website 2', 'Website 3'];
export const mockProducts = [
  { id: '1', name: 'Spa Package', price: 150, businessName: 'Luxury Spa', category: 'Wellness', image: '', accessibility: ['wheelchair', 'parking'] },
  { id: '2', name: 'Desert Tour', price: 200, businessName: 'Adventure Co', category: 'Tours', image: '', accessibility: ['wheelchair'] },
  { id: '3', name: 'Hotel Room', price: 300, businessName: 'Beach Hotel', category: 'Accommodation', image: '', accessibility: ['wheelchair', 'parking', 'elevator'] },
  { id: '4', name: 'Dining Experience', price: 120, businessName: 'Fine Restaurant', category: 'Dining', image: '', accessibility: ['parking'] },
];




export const generateMockOrders = (count: number): Order[] => {
  const statuses: Order['orderStatus'][] = ['draft', 'processing', 'paid', 'confirmed', 'delivered', 'completed', 'cancelled', 'partially_cancelled', 'failed'];
  const paymentStatuses: Order['paymentStatus'][] = ['pending', 'success', 'failed', 'refunded', 'partially_refunded'];
  const deliveryTypes: Order['deliveryType'][] = ['pickup', 'delivery', 'digital'];
  const vendors = ['Beersheba Bistro', 'Desert Delight', 'Negev Tours', 'Arad Adventures', 'Mitzpe Ramon Resort'];
  const campaigns = ['Summer Sale 2026', 'Desert Discovery', 'Family Fun Days', 'Food Festival', 'Adventure Week'];

  const products = [
    { name: 'Guided Desert Tour', price: 120, imageUrl: 'https://via.placeholder.com/150', description: 'Explore the desert with a professional guide.', category: 'Tour' },
    { name: 'Sunset Jeep Ride', price: 95, imageUrl: 'https://via.placeholder.com/150', description: 'Experience the sunset in a Jeep.', category: 'Activity' },
    { name: 'Bedouin Dinner Experience', price: 75, imageUrl: 'https://via.placeholder.com/150', description: 'Enjoy a traditional Bedouin dinner.', category: 'Dinner' },
    { name: 'Hotel Night Package', price: 180, imageUrl: 'https://via.placeholder.com/150', description: 'Stay overnight in a luxurious hotel.', category: 'Accommodation' },
    { name: 'Makhtesh Ramon Hike', price: 60, imageUrl: 'https://via.placeholder.com/150', description: 'Hike through the Makhtesh Ramon.', category: 'Hike' },
    { name: 'Wine Tasting Tour', price: 85, imageUrl: 'https://via.placeholder.com/150', description: 'Sample local wines on a guided tour.', category: 'Tour' },
    { name: 'Pottery Workshop', price: 45, imageUrl: 'https://via.placeholder.com/150', description: 'Create pottery pieces in a hands-on workshop.', category: 'Workshop' },
  ];

  return Array.from({ length: count }, (_, i) => {
    const orderProducts: OrderProduct[] = Array.from(
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
          deliveryType: Math.random() > 0.5 ? 'pickup' : 'delivery',
          imageUrl: product.imageUrl,
          description: product.description,
          category: product.category,
        };
      }
    );

    const totalAmount = orderProducts.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);
    const voucherPortion = Math.random() > 0.3 ? Math.floor(totalAmount * (Math.random() * 0.5)) : 0;
    const deliveryFee = orderProducts.some(p => p.deliveryType === 'delivery') ? 15 : 0;

    return {
      id: `ORD-${String(10000 + i).padStart(5, '0')}`,
      purchaserName: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      phone: `+972-50-${String(Math.floor(Math.random() * 10000000)).padStart(7, '0')}`,
      orderType: Math.random() > 0.5 ? 'online' : 'offline',
      orderStatus: statuses[Math.floor(Math.random() * statuses.length)],
      paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      paymentMethod: voucherPortion > 0 ? ['voucher', 'credit_card'] : ['credit_card'],
      totalAmount: totalAmount + deliveryFee,
      voucherAmount: voucherPortion,
      creditCardAmount: totalAmount - voucherPortion,
      vendors: [...new Set(orderProducts.map(p => p.vendor))],
      campaign: campaigns[Math.floor(Math.random() * campaigns.length)],
      deliveryType: deliveryTypes[Math.floor(Math.random() * deliveryTypes.length)],
      createdDate: new Date(2026, 0, Math.floor(Math.random() * 30) + 1).toISOString(),
      paymentDate: new Date(2026, 0, Math.floor(Math.random() * 30) + 1).toISOString(),
      products: orderProducts,
      address: Math.random() > 0.5 ? '123 Main St, Beersheba' : undefined,
      campaignCode: `CAMP${Math.floor(Math.random() * 1000)}`,
      qrScanned: Math.random() > 0.5,
      deliveryFee,
    };
  });
};

// Mock products for selection
export const availableProducts = [
  // Experiences
  { id: 'P001', name: 'Desert Safari Experience', vendor: 'Desert Tours Ltd', category: 'Experience', price: 450 },
  { id: 'P002', name: 'Stargazing Night Tour', vendor: 'Desert Tours Ltd', category: 'Experience', price: 280 },
  { id: 'P003', name: 'Local Cuisine Workshop', vendor: 'Culinary Negev', category: 'Experience', price: 220 },
  { id: 'P004', name: 'Bedouin Cultural Experience', vendor: 'Heritage Tours', category: 'Experience', price: 320 },
  { id: 'P005', name: 'Ceramic Workshop', vendor: 'Negev Arts', category: 'Experience', price: 180 },
  { id: 'P006', name: 'Wine Tasting Tour', vendor: 'Negev Wineries', category: 'Experience', price: 295 },
  { id: 'P007', name: 'Photography Safari', vendor: 'Lens & Desert', category: 'Experience', price: 380 },
  { id: 'P008', name: 'Sunset Camel Ride', vendor: 'Desert Adventures', category: 'Experience', price: 240 },

  // Accommodations
  { id: 'P009', name: 'Boutique Hotel Room', vendor: 'Negev Inn', category: 'Accommodation', price: 680 },
  { id: 'P010', name: 'Desert Lodge Suite', vendor: 'Negev Inn', category: 'Accommodation', price: 920 },
  { id: 'P011', name: 'Eco-Cabin Experience', vendor: 'Green Desert Retreats', category: 'Accommodation', price: 540 },
  { id: 'P012', name: 'Luxury Glamping Tent', vendor: 'Negev Under Stars', category: 'Accommodation', price: 750 },
  { id: 'P013', name: 'Family Suite Package', vendor: 'Oasis Hotel', category: 'Accommodation', price: 1150 },

  // Tours & Activities
  { id: 'P014', name: 'Hiking Guide Service', vendor: 'Trail Masters', category: 'Service', price: 350 },
  { id: 'P015', name: 'Off-Road Jeep Tour', vendor: 'Desert Adventures', category: 'Tour', price: 420 },
  { id: 'P016', name: 'Archaeological Site Tour', vendor: 'Heritage Tours', category: 'Tour', price: 260 },
  { id: 'P017', name: 'Mountain Biking Adventure', vendor: 'Trail Masters', category: 'Activity', price: 310 },
  { id: 'P018', name: 'Rock Climbing Session', vendor: 'Summit Negev', category: 'Activity', price: 275 },

  // Food & Dining
  { id: 'P019', name: 'Traditional Dinner Experience', vendor: 'Culinary Negev', category: 'Dining', price: 185 },
  { id: 'P020', name: 'Farm-to-Table Breakfast', vendor: 'Green Desert Retreats', category: 'Dining', price: 95 },
  { id: 'P021', name: 'Gourmet Picnic Package', vendor: 'Oasis Catering', category: 'Dining', price: 145 },

  // Wellness & Spa
  { id: 'P022', name: 'Desert Spa Package', vendor: 'Serenity Spa Negev', category: 'Wellness', price: 480 },
  { id: 'P023', name: 'Yoga Retreat Day', vendor: 'Mindful Desert', category: 'Wellness', price: 225 },
  { id: 'P024', name: 'Massage & Hot Springs', vendor: 'Serenity Spa Negev', category: 'Wellness', price: 340 },

  // Workshops & Classes
  { id: 'P025', name: 'Weaving Workshop', vendor: 'Negev Arts', category: 'Workshop', price: 160 },
  { id: 'P026', name: 'Bread Baking Class', vendor: 'Culinary Negev', category: 'Workshop', price: 120 },
  { id: 'P027', name: 'Calligraphy Workshop', vendor: 'Heritage Arts Center', category: 'Workshop', price: 140 },

  // Special Packages
  { id: 'P028', name: 'Weekend Explorer Package', vendor: 'Desert Tours Ltd', category: 'Package', price: 1450 },
  { id: 'P029', name: 'Romantic Getaway Bundle', vendor: 'Negev Romance', category: 'Package', price: 1680 },
  { id: 'P030', name: 'Adventure Seeker Pass', vendor: 'Desert Adventures', category: 'Package', price: 890 },
];