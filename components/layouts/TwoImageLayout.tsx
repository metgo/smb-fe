import { BusinessCard } from "../cards";
import { getBusinessList } from "@/lib/helpers";

// Define layout structure for each card
const layout = [
  { width: 630, height: 886 },
  { width: 630, height: 886 },
];

// Group items into columns (manually since layout is specific)
const cols = [0,1]

const TwoImageLayout = () => {
  const businesses = getBusinessList(2);


  return (
    <div className="flex gap-5">
      {cols.map((i) => (
        <BusinessCard
          key={businesses[i].id}
          width={layout[i].width}
          height={layout[i].height}
          imageUrl={businesses[i].image}
        />
      ))}
    </div>
  );
};

export default TwoImageLayout;
