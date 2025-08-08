import { NextImage } from "@/components/ui";
import React from "react";

const ProductInfo = ({
  className,
  products,
}: {
  className: string;
  products: any[];
}) => {
  return (
    <div
      className={`flex flex-col justify-between bg-white p-4 max-sm:rounded-none rounded-md min-w-[20rem] shadow ${className}`}
    >
      <section>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <h2 className="text-2xl font-bold mb-4">סיכום הזמנה</h2>
          </div>
        </div>
        <div>
          {products?.map((item) => (
            <div
              key={item._id}
              className="grid grid-cols-5 gap-2 items-center  justify-between"
            >
              <NextImage
                imgSrc={item.images[0].image}
                alt={item.images[0].image}
                width={100}
                height={100}
                className="rounded-md col-span-1 "
              />
              <div className="col-span-3 font-normal">{item.name}</div>
              <div className="col-span-1">{item.price.sellingPrice}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductInfo;
