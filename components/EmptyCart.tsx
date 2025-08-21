import Link from "next/link";
import { cartLabels } from "@/constant/hebrew";
import { pathNames } from "@/lib/endpoints";

const EmptyCart = () => {
  return (
    <div className="flex items-center justify-center flex-col gap-3 h-[80vh] w-full">
      <h3 className="text-2xl font-bold">{cartLabels.yourCartIsEmptyYet}</h3>
      <p className="max-w-60 text-center font-normal">
        {cartLabels.emptyCartText}
      </p>
      <Link
        href={pathNames.businesses}
        className="font-bold text-white bg-black rounded-md py-2.5 px-16 cursor-pointer"
      >
        {cartLabels.toViewBusinesses}
      </Link>
    </div>
  );
};

export default EmptyCart;
