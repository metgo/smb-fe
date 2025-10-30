// Mobile reference width
export const MOBILE_REFERENCE_WIDTH = 400;

// Constant width for all cards
const MOBILE_CARD_WIDTH = 180;

// Varying card heights (150px → 300px)
const MOBILE_CARD_HEIGHTS = Array.from({ length: 16 }, (_, i) => 150 + i * 10);

// Type definition
export interface MobileLayoutItem {
  width: number;
  height: number;
}

// Helper to create card items
const createMobileItems = (count: number): MobileLayoutItem[] =>
  Array.from({ length: count }, (_, i) => ({
    width: MOBILE_CARD_WIDTH,
    height: MOBILE_CARD_HEIGHTS[i % MOBILE_CARD_HEIGHTS.length],
  }));

// ✅ Function that dynamically generates layouts
export const getMobileCardLayouts = (count: number) => ({
  mobileLayout1: [{ width: MOBILE_REFERENCE_WIDTH, height: 300 }],
  mobileLayout2: createMobileItems(count),
});

// ✅ Height-balanced column distribution
export const getMobileCardColumns = (count: number) => {
  const layout = createMobileItems(count);

  const col1: number[] = [];
  const col2: number[] = [];
  let col1Height = 0;
  let col2Height = 0;

  // Assign each card to the shorter column
  layout.forEach((item, index) => {
    if (col1Height <= col2Height) {
      col1.push(index);
      col1Height += item.height;
    } else {
      col2.push(index);
      col2Height += item.height;
    }
  });

  return {
    mobileLayout1: { col1: [0] },
    mobileLayout2: { col1, col2 },
  };
};
