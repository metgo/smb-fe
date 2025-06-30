import { misc } from "@/constant/hebrew";
import Image from "next/image";
import { IconImage } from "../ui";

const ProductCard = ({ images, name, desc, price }: ProductProps) => {
  return (
    <div className=" rounded-2xl overflow-hidden border border-primary">
      <div>
        <Image
          width={200}
          height={224}
          src={images[0].image}
          alt={images[0].alt}
          className="w-full h-[224px] object-cover"
        />
        <div></div>
      </div>
      <div className="p-4">
        <h3 className="text-drak font-bold">{name}</h3>
        <p className="line-clamp-2 text-theme text-[12px]">{desc}</p>
        <div className="text-3xl font-normal">{price}</div>

        <div className="grid grid-cols-4 items-center justify-between gap-2.5 mt-2.5">
          <button
            type="button"
            onClick={() => {}}
            className="h-10 rounded-md bg-drak text-white col-span-3"
          >
            {misc.quickPurchase}
          </button>
          <div className="col-span-1">
            <IconImage width={40} height={40} icon="circular-cart" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
