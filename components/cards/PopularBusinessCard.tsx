import Link from "next/link";

import { NextImage } from "../ui";
import { searchText } from "@/constant/hebrew";

const PopularBusinessCard = ({
  name,
  description,
  images,
  logo,
}: GeneralProductCardProps) => {
  return (
    <div style={{ width: 240, height: 240 }} className="relative">
      <NextImage
        isFill
        alt="Popular"
        imgSrc={images[0].image}
        width={240}
        height={240}
        className="rounded-xl"
      />

      <div
        style={{ width: 40, height: 40 }}
        className="absolute right-4 top-4 rounded-lg overflow-hidden border border-lightGray "
      >
        <NextImage
          isFill
          alt={logo?.alt}
          imgSrc={logo?.image}
          width={40}
          height={40}
        />
      </div>

      <Link
        href={"/"}
        className="text-white text-sm font-bold px-4 py-2.25 bg-dark/50 rounded-lg absolute left-4 top-4"
      >
        {searchText.moreDetails}
      </Link>

      <div className="w-full h-full relative">
        <div className="absolute bottom-0 right-0 h-1/2 w-full bg-gradient-to-t from-black/40 to-transparent rounded-b-xl" />
        <div className="text-white font-bold absolute right-4 bottom-4">
          <h4 className="line-clamp-1">{name}</h4>
          <div
            className="text-[12px] line-clamp-1"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      </div>
    </div>
  );
};

export default PopularBusinessCard;
