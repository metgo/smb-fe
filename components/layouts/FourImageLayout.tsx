import { BusinessCard } from "../cards";
import { getBusinessList } from "@/lib/helpers";

// Define layout structure for each card
const layout = [
  { width: 630, height: 886 },

  { width: 305, height: 433 },
  { width: 305, height: 433 },

  { width: 630, height: 433 },
];

// Group items into columns (manually since layout is specific)
const col1 = [0]
const col2 = [1, 2];

const FourImageLayout = () => {
  const businesses = getBusinessList(4);


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
        <div className="flex gap-5">
          {col2.map((i) => (
            <BusinessCard
              key={businesses[i].id}
              width={layout[i].width}
              height={layout[i].height}
              imageUrl={businesses[i].image}
            />
          ))}
        </div>
        <BusinessCard
          key={businesses[3].id}
          width={layout[3].width}
          height={layout[3].height}
          imageUrl={businesses[3].image}
        />
      </div>
    </div>
  );
};

export default FourImageLayout;
