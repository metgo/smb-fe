import { BusinessCard } from "../cards";
import { getBusinessList } from "@/lib/helpers";

// Define layout structure for each card
const layout = [
  { width: 500, height: 433 },

  { width: 240, height: 433 },
  { width: 240, height: 433 },

  { width: 240, height: 190 },
  { width: 240, height: 466 },
  { width: 240, height: 190 },

  { width: 240, height: 466 },
  { width: 240, height: 190 },
  { width: 240, height: 190 },

  { width: 240, height: 190 },
  { width: 240, height: 190 },
  { width: 240, height: 466 },
];

// Group items into columns (manually since layout is specific)
const col1 = [1, 2]
const col2 = [3, 4, 5];
const col3 = [6, 7, 8];
const col4 = [9, 10, 11];


const TwelveImageLayout = () => {
  const businesses = getBusinessList(12);


  return (
    <div className="flex gap-5">
      {/* Column 1 */}
      <div className="space-y-5">
        <BusinessCard
          key={businesses[0].id}
          width={layout[0].width}
          height={layout[0].height}
          imageUrl={businesses[0].image}
        />
        <div className="flex gap-5">
          {col1.map((i) => (
            <BusinessCard
              key={businesses[i].id}
              width={layout[i].width}
              height={layout[i].height}
              imageUrl={businesses[i].image}
            />
          ))}
        </div>
      </div>

      {/* Column 2 */}
      <div className="space-y-5">
        {col2.map((i) => (
          <BusinessCard
            key={businesses[i].id}
            width={layout[i].width}
            height={layout[i].height}
            imageUrl={businesses[i].image}
          />
        ))}
      </div>

      {/* Column 3 */}
      <div className="space-y-5">
        {col3.map((i) => (
          <BusinessCard
            key={businesses[i].id}
            width={layout[i].width}
            height={layout[i].height}
            imageUrl={businesses[i].image}
          />
        ))}
      </div>

      {/* Column 4 */}
      <div className="space-y-5">
        {col4.map((i) => (
          <BusinessCard
            key={businesses[i].id}
            width={layout[i].width}
            height={layout[i].height}
            imageUrl={businesses[i].image}
          />
        ))}
      </div>
    </div>
  );
};

export default TwelveImageLayout;

