import Image from "next/image";
import { LocationPinIcon } from "@/components/ui/icons";

const FavoriteItemCard = ({ width, height, business }: BusinessCardProps) => {
  return (
    <div style={{ width, height }}>
      <div className="w-full h-full relative group">
        <Image
          fill
          priority
          unoptimized
          quality={100}
          alt={business.name || "Business Image"}
          src={business.imageUrl || "/images/image-placeholder.jpg"}
          className="object-cover h-full w-full rounded-xl"
        />
        <div className="absolute bottom-0 right-0 ps-4 pb-4 text-white font-bold">
          <h3 className=" lg:text-[1rem] xl:tetx-[1.5rem]">{business.name}</h3>
          <div className="flex items-center gap-2">
            <LocationPinIcon />
            {/* <span className="md:text-sm">{business.location}</span> */}
          </div>
          <div className=" z-50 h-40 w-full absolute bottom-0 right-0" />
        </div>

        <div className="hidden absolute top-4 right-4 group-hover:flex items-center gap-2.5">
          {/* <IconWrapper
            onClick={addWishlistHandler}
          >
            <FaRegHeart size={20} />
          </IconWrapper> */}
        </div>
      </div>
    </div>
  );
};

export default FavoriteItemCard;
