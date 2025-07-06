import { IconImage } from "@/components/ui";
// import { misc } from "@/constant/hebrew";

const RatingReviewLocation = ({
  address,
  // ratingCount,
  // reviewCount,
}: {
  address: Address;
  ratingCount: number;
  reviewCount: number;
}) => {
  return (
    <div className="flex gap-1.25 items-center text-theme">
      <IconImage icon="location-gray" />
      <div className=" text-sm font-bold flex items-center gap-2">
        <span>{address?.city}</span>,<span>{address?.country}</span>
      </div>
      {/* <div className="w-0.5 h-3.5 bg-theme" />
      <IconImage icon="star-rating" />
      <span className="font-bold">{ratingCount}</span>
      <div className="underline">
        <span>{reviewCount + " " + misc.opinion}</span>
      </div> */}
    </div>
  );
};

export default RatingReviewLocation;
