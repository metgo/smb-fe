import { getBusinessList } from "@/lib/helpers";
import { BusinessCard } from "../cards";
import BusinessPinMap from "../maps/BusinessPinMap";

const layouts: Record<string, LayoutItem[]> = {
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

const columns: Record<string, Record<string, number[]>> = {
  layout3: { col1: [0, 1], col2: [2] },
  layout4: { col1: [0, 1], col2: [2, 3] },
  layout5: { col1: [0, 1, 2], col2: [3, 4] },
  layout6: { col1: [0, 1], col2: [2, 3], col3: [4, 5] },
  layout7: { col1: [0, 1], col2: [2, 3, 4], col3: [5, 6] },
  layout8: { col1: [0, 1], col2: [2, 3, 4], col3: [5, 6, 7] },
  layout9: { col1: [0, 1, 2], col2: [3, 4, 5], col3: [6, 7, 8] },
};


const MapBusinessIntegratedLayout = ({ imageCount }: { imageCount: number }) => {
  const businesses = getBusinessList(imageCount);
  const layoutOptions = Object.entries(layouts)
    .map(([key, value]) => ({ key, length: value.length }))
    .sort((a, b) => b.length - a.length); // Start from the biggest layout

  const layoutChunks: { key: string; offset: number }[] = [];
  let remaining = imageCount;
  let offset = 0;

  while (remaining > 0) {
    const layout = layoutOptions.find(l => l.length <= remaining);
    if (!layout) break;

    layoutChunks.push({ key: layout.key, offset });
    offset += layout.length;
    remaining -= layout.length;
  }

  const renderCards = (layoutKey: string, layoutOffset: number, indexes: number[]) => {
    const layout = layouts[layoutKey];
    return (
      <div className="space-y-5">
        {indexes.map(i => {
          const business = businesses[layoutOffset + i];
          const layoutItem = layout[i];
          return (
            <BusinessCard
              key={business.id}
              width={layoutItem.width}
              height={layoutItem.height}
              imageUrl={business.image}
            />
          );
        })}
      </div>
    );
  };

  const renderLayout = (layoutKey: string, layoutOffset: number) => {
    const layout = layouts[layoutKey];
    const columnLayout = columns[layoutKey];

    if (!columnLayout) {
      return (
        <div className="space-y-5">
          {layout.map((item, i) => (
            <BusinessCard
              key={businesses[layoutOffset + i].id}
              width={item.width}
              height={item.height}
              imageUrl={businesses[layoutOffset + i].image}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="flex gap-5">
        {Object.values(columnLayout).map((indexes, idx) => (
          <div className="space-y-5" key={`${layoutKey}-col-${idx}`}>
            {renderCards(layoutKey, layoutOffset, indexes)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex items-center ps-70">
      <div className="flex flex-col gap-10 max-h-[95vh] w-[95%] overflow-y-auto hide-scrollbar py-10">
        {layoutChunks.map(({ key, offset }, idx) => (
          <div key={`${key}-${offset}-${idx}`}>{renderLayout(key, offset)}</div>
        ))}
      </div>
      <BusinessPinMap />
    </div>
  );
};

export default MapBusinessIntegratedLayout;
