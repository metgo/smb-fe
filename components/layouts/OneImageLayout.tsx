import { BusinessCard } from "../cards";
import { getBusinessList } from "@/lib/helpers";

// Define layout structure for each card
const layout = [
  { width: 1280, height: 886 },
];


const OneImageLayout = () => {
  const businesses = getBusinessList(1);

  return (
    <BusinessCard
      key={businesses[0].id}
      width={layout[0].width}
      height={layout[0].height}
      imageUrl={businesses[0].image}
    />
  );
};

export default OneImageLayout;
