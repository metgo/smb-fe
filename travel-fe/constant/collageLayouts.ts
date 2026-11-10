// Define the reference screen width
export const REFERENCE_SCREEN_WIDTH = 1400;

// Common dimension constants
const DIMENSIONS = {
  large: { width: 1280, height: 886 },
  medium: { width: 630, height: 886 },
  mediumHalf: { width: 630, height: 433 },
  small: { width: 305, height: 433 },
  smallShort: { width: 305, height: 298 },
  smallTall: { width: 305, height: 566 },
  tiny: { width: 305, height: 250 },
  tinyShort: { width: 305, height: 190 },
  tinyMedium: { width: 305, height: 346 },
  tinyLong: { width: 305, height: 466 },
  grid: { width: 240, height: 220 },
  gridTall: { width: 240, height: 408 },
  gridTaller: { width: 240, height: 466 },
  gridShort: { width: 240, height: 190 },
  gridMedium: { width: 240, height: 235 },
  mediumWide: { width: 500, height: 433 },
};

// Helper to create an array of LayoutItems
const createItems = (item: LayoutItem, count: number): LayoutItem[] =>
  Array(count)
    .fill(item)
    .map((item) => ({ ...item }));

export const onlyCardsLayouts: Record<string, LayoutItem[]> = (() => {
  // Helper to generate layouts with patterns
  const layouts: Record<string, LayoutItem[]> = {
    layout1: [DIMENSIONS.large],
    layout2: createItems(DIMENSIONS.medium, 2),
    layout3: [DIMENSIONS.medium, ...createItems(DIMENSIONS.mediumHalf, 2)],
    layout4: [
      DIMENSIONS.medium,
      ...createItems(DIMENSIONS.small, 2),
      DIMENSIONS.mediumHalf,
    ],
    layout5: [
      DIMENSIONS.medium,
      DIMENSIONS.smallTall,
      DIMENSIONS.smallShort,
      DIMENSIONS.smallShort,
      DIMENSIONS.smallTall,
    ],
    layout6: [
      DIMENSIONS.medium,
      ...createItems(DIMENSIONS.tiny, 2),
      DIMENSIONS.tinyMedium,
      DIMENSIONS.smallShort,
      DIMENSIONS.smallTall,
    ],
    layout7: [
      DIMENSIONS.medium,
      ...createItems(DIMENSIONS.tiny, 2),
      DIMENSIONS.tinyMedium,
      DIMENSIONS.tinyLong,
      ...createItems(DIMENSIONS.tinyShort, 2),
    ],
    layout8: [
      ...createItems(DIMENSIONS.mediumHalf, 2),
      ...createItems(DIMENSIONS.tiny, 2),
      DIMENSIONS.tinyMedium,
      DIMENSIONS.tinyLong,
      ...createItems(DIMENSIONS.tinyShort, 2),
    ],
    layout9: [
      ...createItems(DIMENSIONS.mediumHalf, 2),
      DIMENSIONS.tinyMedium,
      ...createItems(DIMENSIONS.tiny, 2),
      ...createItems(DIMENSIONS.tinyShort, 2),
      DIMENSIONS.tinyShort,
      { width: 305, height: 256 },
    ],
    layout10: [
      DIMENSIONS.mediumHalf,
      ...createItems(DIMENSIONS.small, 2),
      DIMENSIONS.tinyMedium,
      ...createItems(DIMENSIONS.tiny, 2),
      ...createItems(DIMENSIONS.tinyShort, 2),
      DIMENSIONS.tinyShort,
      { width: 305, height: 256 },
    ],
    layout11: [
      ...createItems(DIMENSIONS.mediumWide, 2),
      ...createItems(DIMENSIONS.gridShort, 2),
      DIMENSIONS.gridTaller,
      DIMENSIONS.gridTaller,
      ...createItems(DIMENSIONS.gridShort, 2),
      ...createItems(DIMENSIONS.gridShort, 2),
      DIMENSIONS.gridTaller,
    ],
    layout12: [
      DIMENSIONS.mediumWide,
      ...createItems(DIMENSIONS.gridTall, 2),
      ...createItems(DIMENSIONS.gridShort, 2),
      DIMENSIONS.gridTaller,
      DIMENSIONS.gridTaller,
      ...createItems(DIMENSIONS.gridShort, 2),
      ...createItems(DIMENSIONS.gridShort, 2),
      DIMENSIONS.gridTaller,
    ],
    layout13: [
      DIMENSIONS.gridTall,
      DIMENSIONS.gridTaller,
      ...createItems(DIMENSIONS.gridShort, 2),
      DIMENSIONS.gridTaller,
      ...createItems(DIMENSIONS.gridShort, 2),
      DIMENSIONS.gridTaller,
      DIMENSIONS.gridTaller,
      ...createItems(DIMENSIONS.gridShort, 2),
      DIMENSIONS.gridTall,
      DIMENSIONS.gridTaller,
    ],
    layout14: [
      DIMENSIONS.gridTaller,
      ...createItems(DIMENSIONS.gridShort, 2),
      DIMENSIONS.gridTall,
      ...createItems(DIMENSIONS.grid, 2),
      ...createItems(DIMENSIONS.grid, 2),
      DIMENSIONS.gridTall,
      DIMENSIONS.gridTaller,
      ...createItems(DIMENSIONS.gridShort, 2),
      DIMENSIONS.gridTall,
      DIMENSIONS.gridTaller,
    ],
    layout15: [
      DIMENSIONS.gridTall,
      ...createItems(DIMENSIONS.grid, 2),
      ...createItems(DIMENSIONS.grid, 2),
      DIMENSIONS.gridTall,
      DIMENSIONS.gridTall,
      ...createItems(DIMENSIONS.grid, 2),
      ...createItems(DIMENSIONS.grid, 2),
      DIMENSIONS.gridTall,
      DIMENSIONS.gridTall,
      ...createItems(DIMENSIONS.grid, 2),
    ],
    layout16: [
      ...createItems(DIMENSIONS.gridShort, 2),
      DIMENSIONS.grid,
      DIMENSIONS.gridMedium,
      ...createItems(DIMENSIONS.grid, 2),
      DIMENSIONS.gridTall,
      DIMENSIONS.grid,
      DIMENSIONS.gridTall,
      DIMENSIONS.grid,
      DIMENSIONS.gridTall,
      ...createItems(DIMENSIONS.grid, 2),
      ...createItems(DIMENSIONS.grid, 2),
      DIMENSIONS.gridTall,
    ],
  };
  return layouts;
})();

export const onlyCardsColumns: Record<string, Record<string, number[]>> = {
  layout2: { col1: [0], col2: [1] },
  layout3: { col1: [0], col2: [1, 2] },
  layout4: { col1: [0], subCol2: [1, 2], col2: [3] },
  layout5: { col1: [0], col2: [1, 2], col3: [3, 4] },
  layout6: { col1: [0], col2: [1, 2, 3], col3: [4, 5] },
  layout7: { col1: [0], col2: [1, 2, 3], col3: [4, 5, 6] },
  layout8: { col1: [0, 1], col2: [2, 3, 4], col3: [5, 6, 7] },
  layout9: { col1: [0, 1], col2: [2, 3, 4], col3: [5, 6, 7, 8] },
  layout10: { col1: [0], subCol1: [1, 2], col2: [3, 4, 5], col3: [6, 7, 8, 9] },
  layout11: {
    col1: [0, 1],
    col2: [2, 3, 4],
    col3: [5, 6, 7],
    col4: [8, 9, 10],
  },
  layout12: {
    col1: [0],
    subCol1: [1, 2],
    col2: [3, 4, 5],
    col3: [6, 7, 8],
    col4: [9, 10, 11],
  },
  layout13: {
    col1: [0, 1],
    col2: [2, 3, 4],
    col3: [5, 6, 7],
    col4: [8, 9, 10],
    col5: [11, 12],
  },
  layout14: {
    col1: [0, 1, 2],
    col2: [3, 4, 5],
    col3: [6, 7, 8],
    col4: [9, 10, 11],
    col5: [12, 13],
  },
  layout15: {
    col1: [0, 1, 2],
    col2: [3, 4, 5],
    col3: [6, 7, 8],
    col4: [9, 10, 11],
    col5: [12, 13, 14],
  },
  layout16: {
    col1: [0, 1, 2, 3],
    col2: [4, 5, 6],
    col3: [7, 8, 9],
    col4: [10, 11, 12],
    col5: [13, 14, 15],
  },
};

export const mapIntegratedCardsLayouts: Record<string, LayoutItem[]> = {
  layout1: [{ width: 758, height: 886 }],
  layout2: [
    { width: 760, height: 433 },
    { width: 760, height: 433 },
  ],
  layout3: [
    { width: 370, height: 433 },
    { width: 370, height: 433 },
    { width: 760, height: 433 },
  ],
  layout4: [
    { width: 370, height: 646 },
    { width: 370, height: 220 },
    { width: 370, height: 220 },
    { width: 370, height: 646 },
  ],
  layout5: [
    { width: 370, height: 406 },
    { width: 370, height: 220 },
    { width: 370, height: 220 },
    { width: 370, height: 220 },
    { width: 370, height: 646 },
  ],
  layout6: [
    { width: 240, height: 408 },
    { width: 240, height: 458 },
    { width: 240, height: 458 },
    { width: 240, height: 408 },
    { width: 240, height: 408 },
    { width: 240, height: 458 },
  ],
  layout7: [
    { width: 240, height: 408 },
    { width: 240, height: 458 },
    { width: 240, height: 220 },
    { width: 240, height: 406 },
    { width: 240, height: 220 },
    { width: 240, height: 408 },
    { width: 240, height: 458 },
  ],
  layout8: [
    { width: 240, height: 408 },
    { width: 240, height: 458 },
    { width: 240, height: 220 },
    { width: 240, height: 406 },
    { width: 240, height: 220 },
    { width: 240, height: 190 },
    { width: 240, height: 258 },
    { width: 240, height: 371 },
  ],
  layout9: [
    { width: 240, height: 220 },
    { width: 240, height: 406 },
    { width: 240, height: 220 },

    { width: 240, height: 190 },
    { width: 240, height: 285 },
    { width: 240, height: 371 },

    { width: 240, height: 408 },
    { width: 240, height: 218 },
    { width: 240, height: 220 },
  ],
};

export const mapIntegratedCardsColumns: Record<
  string,
  Record<string, number[]>
> = {
  layout3: { col1: [0, 1], col2: [2] },
  layout4: { col1: [0, 1], col2: [2, 3] },
  layout5: { col1: [0, 1, 2], col2: [3, 4] },
  layout6: { col1: [0, 1], col2: [2, 3], col3: [4, 5] },
  layout7: { col1: [0, 1], col2: [2, 3, 4], col3: [5, 6] },
  layout8: { col1: [0, 1], col2: [2, 3, 4], col3: [5, 6, 7] },
  layout9: { col1: [0, 1, 2], col2: [3, 4, 5], col3: [6, 7, 8] },
};

// ============= Image Gallery ===============
// Layout definitions (image sizes)
export const layoutsNotUsed = {
  layout1: [{ width: 1280, height: 450 }],
  layout2: [
    { width: 635, height: 450 },
    { width: 635, height: 450 },
  ],
  layout3: [
    { width: 630, height: 450 },
    { width: 314.5, height: 450 },
    { width: 314.5, height: 450 },
  ],
  layout4: [
    { width: 630, height: 450 },
    { width: 314.5, height: 450 },
    { width: 314.5, height: 220 },
    { width: 314.5, height: 220 },
  ],
  layout5: [
    { width: 630, height: 450 },
    { width: 314.5, height: 220 },
    { width: 314.5, height: 220 },
    { width: 314.5, height: 220 },
    { width: 314.5, height: 220 },
  ],
};

export const layouts = {
  layout1: [{ width: "100%", height: 550 }],
  layout2: [
    { width: "50%", height: 550 },
    { width: "50%", height: 550 },
  ],
  layout3: [
    { width: "49%", height: 550 },
    { width: "25.5%", height: 550 },
    { width: "25.5%", height: 550 },
  ],
  layout4: [
    { width: "49%", height: 550 },
    { width: "25.5%", height: 550 },
    { width: "25.5%", height: 275 },
    { width: "25.5%", height: 275 },
  ],
  layout5: [
    { width: "49%", height: 550 },
    { width: "25.5%", height: 275 },
    { width: "25.5%", height: 275 },
    { width: "25.5%", height: 275 },
    { width: "25.5%", height: 275 },
  ],
};

// Row layout represents images grouped **by column**
export const rowsLayout = {
  row1: [[0]],
  row2: [[0], [1]],
  row3: [[0], [1], [2]],
  row4: [[0], [1], [2, 3]],
  row5: [[0], [1, 2], [3, 4]],
};

// Helper to compute border radius classes
export function getRoundedClass(layout: string, index: number) {
  switch (layout) {
    case "layout1":
      return "rounded-[10px]";
    case "layout2":
      if (index === 0) return "rounded-tr-[10px] rounded-br-[10px]";
      if (index === 1) return "rounded-tl-[10px] rounded-bl-[10px]";
      break;
    case "layout3":
      if (index === 0) return "rounded-tr-[10px] rounded-br-[10px]";
      if (index === 2) return "rounded-tl-[10px] rounded-bl-[10px]";
      break;
    case "layout4":
      if (index === 0) return "rounded-tr-[10px] rounded-br-[10px]";
      if (index === 2) return "rounded-tl-[10px]";
      if (index === 3) return "rounded-bl-[10px]";
      break;
    case "layout5":
      if (index === 0) return "rounded-tr-[10px] rounded-br-[10px]";
      if (index === 3) return "rounded-tl-[10px]";
      if (index === 4) return "rounded-bl-[10px]";
      break;
    default:
      return "rounded-none";
  }
}

export const galleryPreviewLayouts = {
  layout1: [{ width: "100%", height: 550 }],
  layout2: [
    { width: "50%", height: 550 },
    { width: "50%", height: 550 },
  ],
  layout3: [
    { width: "49%", height: 550 },
    { width: "25.5%", height: 550 },
    { width: "25.5%", height: 550 },
  ],
  layout4: [
    { width: "49%", height: 550 },
    { width: "25.5%", height: 550 },
    { width: "25.5%", height: 270 },
    { width: "25.5%", height: 270 },
  ],
  layout5: [
    { width: "49%", height: 550 },
    { width: "25.5%", height: 275 },
    { width: "25.5%", height: 275 },
    { width: "25.5%", height: 275 },
    { width: "25.5%", height: 275 },
  ],
  layout6: [
    { width: "49%", height: 550 },
    { width: "25.5%", height: 275 },
    { width: "25.5%", height: 275 },
    { width: "25.5%", height: 270 },
    { width: "25.5%", height: 270 },
    { width: "25.5%", height: 275 },
  ],
  layout7: [
    { width: "49%", height: 550 },
    { width: "25.5%", height: 275 },
    { width: "25.5%", height: 275 },
    { width: "25.5%", height: 270 },
    { width: "25.5%", height: 270 },
    { width: "25.5%", height: 275 },
    { width: "25.5%", height: 275 },
  ],
  layout8: [
    { width: "49%", height: 275 },
    { width: "49%", height: 275 },
    { width: "25.5%", height: 270 },
    { width: "25.5%", height: 270 },
    { width: "25.5%", height: 275 },
    { width: "25.5%", height: 275 },
    { width: "25.5%", height: 270 },
    { width: "25.5%", height: 270 },
  ],
  layout9: [
    { width: "49%", height: 275 },
    { width: "49%", height: 275 },
    { width: "25.5%", height: 275 },
    { width: "25.5%", height: 275 },
    { width: "25.5%", height: 275 },
    { width: "25.5%", height: 270 },
    { width: "25.5%", height: 270 },
    { width: "25.5%", height: 270 },
    { width: "25.5%", height: 270 },
  ],
  layout10: [
    { width: "49%", height: 275 },
    { width: "25.5%", height: 275 },
    { width: "25.5%", height: 275 },
    { width: "25.5%", height: 275 },
    { width: "25.5%", height: 270 },
    { width: "25.5%", height: 270 },
    { width: "25.5%", height: 270 },
    { width: "25.5%", height: 270 },
    { width: "25.5%", height: 270 },
    { width: "25.5%", height: 270 },
  ],
  layout11: [
    { width: "33%", height: 275 },
    { width: "33%", height: 275 },
    { width: "33%", height: 275 },
    { width: "18.5%", height: 250 },
    { width: "18.5%", height: 250 },
    { width: "18.5%", height: 350 },
    { width: "18.5%", height: 350 },
    { width: "18.5%", height: 250 },
    { width: "18.5%", height: 250 },
    { width: "18.5%", height: 350 },
  ],
  layout12: [
    { width: "33%", height: 275 },
    { width: "33%", height: 275 },
    { width: "18.5%", height: 350 },
    { width: "18.5%", height: 250 },
    { width: "18.5%", height: 250 },
    { width: "18.5%", height: 350 },
    { width: "18.5%", height: 350 },
    { width: "18.5%", height: 250 },
    { width: "18.5%", height: 250 },
    { width: "18.5%", height: 350 },
  ],
  layout13: [
    { width: "18.5%", height: 350 },
    { width: "18.5%", height: 350 },
    { width: "18.5%", height: 250 },
    { width: "18.5%", height: 250 },
    { width: "18.5%", height: 350 },
    { width: "18.5%", height: 350 },
    { width: "18.5%", height: 250 },
    { width: "18.5%", height: 250 },
    { width: "18.5%", height: 350 },
    { width: "18.5%", height: 350 },
  ],
  layout14: [
    { width: "18.5%", height: 350 },
    { width: "18.5%", height: 250 },
    { width: "18.5%", height: 250 },
    { width: "18.5%", height: 275 },
    { width: "18.5%", height: 275 },
    { width: "18.5%", height: 275 },
    { width: "18.5%", height: 350 },
    { width: "18.5%", height: 350 },
    { width: "18.5%", height: 250 },
    { width: "18.5%", height: 250 },
    { width: "18.5%", height: 350 },
    { width: "18.5%", height: 350 },
  ],
  layout15: [
    { width: "18.5%", height: 350 },
    { width: "18.5%", height: 275 },
    { width: "18.5%", height: 275 },
    { width: "18.5%", height: 275 },
    { width: "18.5%", height: 350 },
    { width: "18.5%", height: 350 },
    { width: "18.5%", height: 275 },
    { width: "18.5%", height: 275 },
    { width: "18.5%", height: 275 },
    { width: "18.5%", height: 350 },
  ],
  layout16: [
    { width: "18.5%", height: 250 },
    { width: "18.5%", height: 250 },
    { width: "18.5%", height: 275 },
    { width: "18.5%", height: 275 },
    { width: "18.5%", height: 275 },
    { width: "18.5%", height: 350 },
    { width: "18.5%", height: 275 },
    { width: "18.5%", height: 350 },
    { width: "18.5%", height: 275 },
    { width: "18.5%", height: 350 },
    { width: "18.5%", height: 275 },
    { width: "18.5%", height: 275 },
    { width: "18.5%", height: 275 },
    { width: "18.5%", height: 350 },
  ],
};
