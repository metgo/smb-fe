import {
  FULL_DESC_MAX,
  matchCategoriesByTaxonomy,
  normalizeBusinessTypes,
  OnboardingTaxonomy,
  SHORT_DESC_MAX,
  clampText,
  htmlToText,
  isPrivateAddress,
  matchAuthorityByName,
  normalizeProfile,
  voteNearestAuthority,
} from './vendor-onboarding.utils';

const taxonomy: OnboardingTaxonomy = {
  categories: [
    { id: 'c1', name: 'Food', hebrewName: 'אוכל' },
    { id: 'c2', name: 'Lodging', hebrewName: 'לינה' },
    { id: 'c3', name: 'Tours', hebrewName: 'טיולים' },
  ],
  accessibilities: [{ id: 'a1', name: 'Parking' }],
  groupTypes: [{ id: 'g1', name: 'Families' }, { id: 'g2', name: 'Couples' }],
  tags: ['יין'],
};

describe('normalizeProfile', () => {
  it('drops ids that are not in the database lists and keeps primary first', () => {
    const p = normalizeProfile(
      {
        primaryCategoryId: 'c2',
        categoryIds: ['c1', 'bogus', 'c2', 'c3'],
        accessibilityIds: ['a1', 'x'],
        groupTypeIds: ['g2', 'g2', 'nope'],
        shortDescription: 'קצר',
        description: 'ארוך',
        businessTypes: [{ category: 'Food & Dining', subcategories: ['Restaurant'] }],
      },
      taxonomy,
      [],
      '',
    );
    expect(p.primaryCategoryId).toBe('c2');
    expect(p.categoryIds).toEqual(['c2', 'c1', 'c3']);
    expect(p.accessibilityIds).toEqual(['a1']);
    expect(p.groupTypeIds).toEqual(['g2']);
    expect(p.confidenceFlags).toEqual([]);
  });

  it('falls back to the first valid category and flags a missing one', () => {
    expect(normalizeProfile({ categoryIds: ['c3'] }, taxonomy, [], '').primaryCategoryId).toBe('c3');
    const none = normalizeProfile({ primaryCategoryId: 'zzz' }, taxonomy, [], '');
    expect(none.primaryCategoryId).toBeNull();
    expect(none.confidenceFlags).toContain('category');
  });

  it('enforces the wizard length limits', () => {
    const p = normalizeProfile(
      { shortDescription: 'א '.repeat(200), description: 'ב '.repeat(600) },
      taxonomy,
      [],
      '',
    );
    expect(p.shortDescription.length).toBeLessThanOrEqual(SHORT_DESC_MAX);
    expect(p.description.length).toBeLessThanOrEqual(FULL_DESC_MAX);
    expect(p.confidenceFlags).toEqual(
      expect.arrayContaining(['shortDescription:trimmed', 'description:trimmed']),
    );
  });

  it('copies product names and prices from the vendor, not the model', () => {
    const p = normalizeProfile(
      { products: [{ index: 0, shortDescription: 'סיור שקיעה' }] },
      taxonomy,
      [
        { name: ' סיור ג׳יפים ', price: 250, bookingRequired: true },
        { name: 'ארוחה', description: 'ארוחת בוקר' },
      ],
      '',
    );
    expect(p.products[0]).toEqual({
      name: 'סיור ג׳יפים',
      shortDescription: 'סיור שקיעה',
      price: 250,
      duration: '',
      bookingRequired: true,
    });
    expect(p.products[1].shortDescription).toBe('ארוחת בוקר');
    expect(p.products[1].price).toBeNull();
    expect(p.confidenceFlags).toContain('products[1].price');
  });

  it('keeps only valid opening hours and social links found in the source', () => {
    const p = normalizeProfile(
      {
        openingHours: [
          { day: 'sun', open: '09:00', close: '17:00' },
          { day: 'SUN', open: '10:00', close: '11:00' },
          { day: 'MON', open: '9am', close: '5pm' },
          { day: 'SAT', closed: true },
          { day: 'XYZ', open: '09:00', close: '10:00' },
        ],
        socialLinks: [
          { platform: 'facebook', url: 'https://facebook.com/real' },
          { platform: 'instagram', url: 'https://instagram.com/invented' },
        ],
      },
      taxonomy,
      [],
      'LINKS: https://facebook.com/real',
    );
    expect(p.openingHours).toEqual([
      {
        day: 'SUN', open: '09:00', close: '17:00', closed: false,
      },
      {
        day: 'SAT', open: '', close: '', closed: true,
      },
    ]);
    expect(p.socialLinks).toEqual([{ platform: 'facebook', url: 'https://facebook.com/real' }]);
  });
});

describe('clampText', () => {
  it('leaves short text alone and cuts long text with an ellipsis', () => {
    expect(clampText('שלום', 10)).toBe('שלום');
    const out = clampText('one two three four five six', 12);
    expect(out.length).toBeLessThanOrEqual(12);
    expect(out.endsWith('…')).toBe(true);
  });
});

describe('isPrivateAddress', () => {
  it.each(['127.0.0.1', '10.1.2.3', '192.168.0.5', '172.20.1.1', '169.254.169.254', '::1', 'fd00::1', '::ffff:10.0.0.1'])(
    'blocks %s',
    ip => expect(isPrivateAddress(ip)).toBe(true),
  );
  it.each(['8.8.8.8', '151.101.1.69', '2a00:1450::1'])('allows %s', ip => expect(isPrivateAddress(ip)).toBe(false));
});

describe('htmlToText', () => {
  it('strips markup and keeps social links and the meta description', () => {
    const text = htmlToText(`<html><head><meta name="description" content="יקב בוטיק"><script>x()</script></head>
      <body><h1>יקב</h1><a href="https://www.facebook.com/winery">fb</a><a href="https://example.com/x">x</a></body></html>`);
    expect(text).toContain('יקב בוטיק');
    expect(text).not.toContain('x()');
    expect(text).toContain('LINKS: https://www.facebook.com/winery');
    expect(text).not.toContain('example.com');
  });
});

describe('authority matching', () => {
  const authorities = [
    { id: 'a1', name: 'עיריית ירוחם' },
    { id: 'a2', name: 'מועצה אזורית רמת נגב' },
  ];

  it('matches an authority whose name contains the city', () => {
    expect(matchAuthorityByName(authorities, 'ירוחם')?.id).toBe('a1');
    expect(matchAuthorityByName(authorities, 'שדה בוקר')).toBeNull();
  });

  it('votes by nearest businesses and needs a majority', () => {
    const pts = [
      { authorityId: 'a2', lat: 30.87, long: 34.79 },
      { authorityId: 'a2', lat: 30.88, long: 34.8 },
      { authorityId: 'a1', lat: 30.99, long: 34.93 },
    ];
    expect(voteNearestAuthority(pts, 30.875, 34.795)?.authorityId).toBe('a2');
    expect(voteNearestAuthority(pts, 32.08, 34.78)).toBeNull();
  });
});

describe('business taxonomy', () => {
  it('keeps known parents with their own trades only, max two parents', () => {
    expect(normalizeBusinessTypes([
      { category: 'Food & Dining', subcategories: ['Brewery & Winery', 'Hotel', 'Restaurant', 'Restaurant'] },
      { category: 'Made Up', subcategories: ['x'] },
      { category: 'Hospitality & Lodging', subcategories: ['Bed & Breakfast'] },
      { category: 'Travel & Transportation', subcategories: ['Tour Operator'] },
    ])).toEqual([
      { category: 'Food & Dining', subcategories: ['Brewery & Winery', 'Restaurant'] },
      { category: 'Hospitality & Lodging', subcategories: ['Bed & Breakfast'] },
    ]);
  });

  it('matches database categories by English or Hebrew name, parents first', () => {
    const cats = [
      { id: 'x1', name: 'Bed and Breakfast' },
      { id: 'x2', name: 'Food and Dining', hebrewName: 'אוכל' },
      { id: 'x3', name: 'Other' },
    ];
    expect(matchCategoriesByTaxonomy(
      [{ category: 'Food & Dining', subcategories: [] }, { category: 'Hospitality & Lodging', subcategories: ['Bed & Breakfast'] }],
      cats,
    )).toEqual(['x2', 'x1']);
  });

  it('lets a taxonomy match override the model category pick', () => {
    const p = normalizeProfile(
      {
        primaryCategoryId: 'c3',
        categoryIds: ['c3'],
        businessTypes: [{ category: 'Food & Dining', subcategories: [] }],
      },
      { ...taxonomy, categories: [...taxonomy.categories, { id: 'c9', name: 'Food & Dining' }] },
      [],
      '',
    );
    expect(p.primaryCategoryId).toBe('c9');
    expect(p.categoryIds).toEqual(['c9', 'c3']);
  });
});
