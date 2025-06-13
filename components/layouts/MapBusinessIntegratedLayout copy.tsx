import { getBusinessList } from "@/lib/helpers";
import { BusinessCard } from "../cards";

const layouts = {
  layout1: [
    { width: 758, height: 886 }
  ],
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
  ]
}

const columns = {
  layout3: {
    col1: [0, 1],
    col2: [2]
  },
  layout4: {
    col1: [0, 1],
    col2: [2, 3]
  },
  layout5: {
    col1: [0, 1, 2],
    col2: [3, 4]
  },
  layout6: {
    col1: [0, 1],
    col2: [2, 3],
    col3: [4, 5]
  },
  layout7: {
    col1: [0, 1],
    col2: [2, 3, 4],
    col3: [5, 6]
  },
  layout8: {
    col1: [0, 1],
    col2: [2, 3, 4],
    col3: [5, 6, 7]
  },
  layout9: {
    col1: [0, 1, 2],
    col2: [3, 4, 5],
    col3: [6, 7, 8]
  }
}

const imageCount: number = 4;

const MapBusinessIntegratedLayout = () => {
  const businesses = getBusinessList(imageCount);

  const renderLayout = () => {
    switch (imageCount) {
      case 1:
        return (
          <BusinessCard
            key={businesses[0].id}
            width={layouts.layout1[0].width}
            height={layouts.layout1[0].height}
            imageUrl={businesses[0].image}
          />
        )
      case 2:
        return (
          <div className=" space-y-5">
            <BusinessCard
              key={businesses[0].id}
              width={layouts.layout2[0].width}
              height={layouts.layout2[0].height}
              imageUrl={businesses[0].image}
            />
            <BusinessCard
              key={businesses[0].id}
              width={layouts.layout2[1].width}
              height={layouts.layout2[1].height}
              imageUrl={businesses[1].image}
            />
          </div>
        )
      case 3:
        return (
          <div className=" space-y-5">
            <div className="flex gap-5">
              {columns.layout3.col1.map(i => (
                <BusinessCard
                  key={businesses[i].id}
                  width={layouts.layout3[i].width}
                  height={layouts.layout3[i].height}
                  imageUrl={businesses[i].image}
                />
              ))}
            </div>
            {columns.layout3.col2.map(i => (
              <BusinessCard
                key={businesses[i].id}
                width={layouts.layout3[i].width}
                height={layouts.layout3[i].height}
                imageUrl={businesses[i].image}
              />
            ))}
          </div>
        )
      case 4:
        return (
          <div className="flex gap-5">
            <div className="space-y-5 ">
              {columns.layout4.col1.map(i => (
                <BusinessCard
                  key={businesses[i].id}
                  width={layouts.layout4[i].width}
                  height={layouts.layout4[i].height}
                  imageUrl={businesses[i].image}
                />
              ))}
            </div>
            <div className="space-y-5 ">
              {columns.layout4.col2.map(i => (
                <BusinessCard
                  key={businesses[i].id}
                  width={layouts.layout4[i].width}
                  height={layouts.layout4[i].height}
                  imageUrl={businesses[i].image}
                />
              ))}
            </div>
          </div>
        )

      default:
        return <div>No matching layout found for image count: {imageCount}</div>;
    }
  }

  return (
    <div>
      <div>

      </div>
      <div>
        {renderLayout()}
      </div>
    </div>
  )
}

export default MapBusinessIntegratedLayout