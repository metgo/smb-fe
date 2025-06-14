import { getBusinessList } from "@/lib/helpers";
import { BusinessCard } from "../cards";
import BusinessPinMap from "../maps/BusinessPinMap";

type LayoutItem = { width: number; height: number };

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
    { width: 240, height: 408 },
    { width: 240, height: 458 },
    { width: 240, height: 220 },
    { width: 240, height: 406 },
    { width: 240, height: 220 },
    { width: 240, height: 190 },
    { width: 240, height: 258 },
    { width: 240, height: 371 },
  ],
};

const columns: Record<string, Record<string, number[]>> = {
  layout3: { col1: [0, 1], col2: [2] },
  layout4: { col1: [0, 1], col2: [2, 3] },
  layout5: { col1: [0, 1, 2], col2: [3, 4] },
  layout6: { col1: [0, 1], col2: [2, 3], col3: [4, 5] },
  layout7: { col1: [0, 1], col2: [2, 3, 4], col3: [5, 6] },
  layout8: { col1: [0, 1], col2: [2, 3, 4], col3: [5, 6, 7] },
  layout9: { col1: [0, 1], col2: [2, 3, 4], col3: [5, 6, 7] },
};

const imageCount = 1;

const MapBusinessIntegratedLayout = () => {
  const businesses = getBusinessList(imageCount);
  const layoutKey = `layout${imageCount}`;
  const layout = layouts[layoutKey];
  const columnLayout = columns[layoutKey];

  if (!layout || businesses.length < layout.length) {
    return <div>No matching layout found or not enough businesses.</div>;
  }

  const renderCards = (indexes: number[]) => (
    <div className="space-y-5">
      {indexes.map(i => (
        <BusinessCard
          key={businesses[i].id}
          width={layout[i].width}
          height={layout[i].height}
          imageUrl={businesses[i].image}
        />
      ))}
    </div>
  );

  const renderLayout = () => {
    if (!columnLayout) {
      return (
        <div className="space-y-5">
          {layout.map((item, i) => (
            <BusinessCard
              key={businesses[i].id}
              width={item.width}
              height={item.height}
              imageUrl={businesses[i].image}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="flex gap-5">
        {Object.values(columnLayout).map((indexes, idx) => (
          <div className="space-y-5" key={idx}>
            {renderCards(indexes)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex items-center gap-5 ps-80">
      {renderLayout()}
      <BusinessPinMap />
    </div>
  );
};

export default MapBusinessIntegratedLayout;
