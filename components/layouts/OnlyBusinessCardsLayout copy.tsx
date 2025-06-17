import { getBusinessList } from "@/lib/helpers";
import { BusinessCard } from "../cards";
import { onlyCardsLayouts } from "@/constant/collageLayouts";


const columns: Record<string, Record<string, number[]>> = {
  layout2: { col1: [0], col2: [1] },
  layout3: { col1: [0], col2: [1, 2] },
  layout4: { col1: [0], subCol2: [1, 2], col2: [3] },
  layout5: { col1: [0], col2: [1, 2], col3: [3, 4] },
  layout6: { col1: [0], col2: [1, 2, 3], col3: [4, 5] },
  layout7: { col1: [0], col2: [1, 2, 3], col3: [4, 5, 6] },
  layout8: { col1: [0, 1], col2: [2, 3, 4], col3: [5, 6, 7] },
  layout9: { col1: [0, 1], col2: [2, 3, 4], col3: [5, 6, 7, 8] },
  layout10: { col1: [0], subCol1: [1, 2], col2: [3, 4, 5], col3: [6, 7, 8, 9] },
  layout11: { col1: [0, 1], col2: [2, 3, 4], col3: [5, 6, 7], col4: [8, 9, 10] },
  layout12: { col1: [0], subCol1: [1, 2], col2: [3, 4, 5], col3: [6, 7, 8], col4: [9, 10, 11] },
  layout13: { col1: [0, 1], col2: [2, 3, 4], col3: [5, 6, 7], col4: [8, 9, 10], col5: [11, 12] },
  layout14: { col1: [0, 1, 2], col2: [3, 4, 5], col3: [6, 7, 8], col4: [9, 10, 11], col5: [12, 13] },
  layout15: { col1: [0, 1, 2], col2: [3, 4, 5], col3: [6, 7, 8], col4: [9, 10, 11], col5: [12, 13, 14] },
  layout16: { col1: [0, 1, 2, 3], col2: [4, 5, 6], col3: [7, 8, 9], col4: [10, 11, 12], col5: [13, 14, 15] }
};


const OnlyBusinessCardsLayout = ({ imageCount }: { imageCount: number }) => {
  const businesses = getBusinessList(imageCount);

  if (businesses.length < 1) {
    return <div>No businesses available</div>;
  }

  const layout16 = onlyCardsLayouts["layout16"];
  const column16 = columns["layout16"];

  const sections: {
    layout: LayoutItem[];
    columnLayout: Record<string, number[]> | null;
    offset: number;
  }[] = [];

  let offset = 0;
  while (offset < businesses.length) {
    const remaining = businesses.length - offset;
    let layoutKey: string;
    let layout: LayoutItem[];
    let columnLayout: Record<string, number[]> | null;

    if (remaining >= 16) {
      layoutKey = "layout16";
      layout = layout16;
      columnLayout = column16 ?? null;
    } else {
      layoutKey = `layout${remaining}`;
      layout = onlyCardsLayouts[layoutKey];
      columnLayout = columns[layoutKey] ?? null;
    }

    if (!layout) break;

    sections.push({
      layout,
      columnLayout,
      offset,
    });

    offset += layout.length;
  }

  const renderCards = (indexes: number[], layout: LayoutItem[], offset: number) => (
    <div className="space-y-5">
      {indexes.map(i => {
        const business = businesses[i + offset];
        const cardLayout = layout[i];
        return (
          <BusinessCard
            key={business.id}
            width={cardLayout.width}
            height={cardLayout.height}
            imageUrl={business.image}
          />
        );
      })}
    </div>
  );

  const renderHorizontalCards = (indexes: number[], layout: LayoutItem[], offset: number) => (
    <div className="flex gap-5 pt-5">
      {indexes.map(i => {
        const business = businesses[i + offset];
        const cardLayout = layout[i];
        return (
          <BusinessCard
            key={business.id}
            width={cardLayout.width}
            height={cardLayout.height}
            imageUrl={business.image}
          />
        );
      })}
    </div>
  );

  const renderLayoutSection = (
    layoutData: LayoutItem[],
    columnLayoutData: Record<string, number[]> | null,
    offset: number,
    index: number
  ) => {
    if (!columnLayoutData) {
      return (
        <div className="space-y-5" key={index}>
          {layoutData.map((item, i) => (
            <BusinessCard
              key={businesses[i + offset].id}
              width={item.width}
              height={item.height}
              imageUrl={businesses[i + offset].image}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="flex gap-5" key={index}>
        {Object.keys(columnLayoutData)
          .filter(key => !key.startsWith("sub"))
          .map((colKey, idx) => {
            const subKey = `sub${colKey[0].toUpperCase()}${colKey.slice(1)}`;
            const mainIndexes = columnLayoutData[colKey];
            const subIndexes = columnLayoutData[subKey];

            return (
              <div key={`${colKey}-${idx}`} className="flex flex-col">
                {renderCards(mainIndexes, layoutData, offset)}
                {subIndexes && renderHorizontalCards(subIndexes, layoutData, offset)}
              </div>
            );
          })}
      </div>
    );
  };

  return (
    <div className="px-20 py-10 flex flex-col gap-10 items-center justify-center w-full h-full">
      {sections.map((section, i) =>
        renderLayoutSection(section.layout, section.columnLayout, section.offset, i)
      )}
    </div>
  );
};



export default OnlyBusinessCardsLayout;
