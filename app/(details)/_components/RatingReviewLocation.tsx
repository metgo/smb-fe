import { IconImage } from "@/components/ui";
import { misc } from "@/constant/hebrew";

const RatingReviewLocation = ({
  city,
  address,
  ratingCount,
  reviewCount,
}: {
  city: string;
  address: string;
  ratingCount: number;
  reviewCount: number;
}) => {
  return (
    <div className="flex gap-1.25 items-center text-theme">
      <IconImage icon="location-gray" />
      <div className=" text-sm font-bold flex items-center gap-2">
        <span>{city}</span>,<span>{address}</span>
      </div>
      <div className="w-0.5 h-3.5 bg-theme" />
      <IconImage icon="star-rating" />
      <span className="font-bold">{ratingCount}</span>
      <div className="underline">
        <span>{reviewCount + " " + misc.opinion}</span>
      </div>
    </div>
  );
};

export default RatingReviewLocation;
