import { BusinessCard } from "../cards";
import { getBusinessList } from "@/lib/helpers";

// Define layout structure for each card
const layout = [
  { width: 630, height: 433 },
  { width: 630, height: 433 },
  { width: 305, height: 250 },
  { width: 305, height: 346 },
  { width: 305, height: 250 },
  { width: 305, height: 466 },
  { width: 305, height: 190 },
  { width: 305, height: 190 },
];

// Group items into columns (manually since layout is specific)
const col1 = [0, 1];
const col2 = [2, 3, 4];
const col3 = [5, 6, 7];

const EightImageLayout = () => {
  const businesses = getBusinessList(8);


  return (
    <div className="flex gap-5">
      {/* Column 1 */}
      <div className="space-y-5">
        {col1.map((i) => (
          <BusinessCard
            key={businesses[i].id}
            width={layout[i].width}
            height={layout[i].height}
            imageUrl={businesses[i].image}
          />
        ))}
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
    </div>
  );
};

export default EightImageLayout;
