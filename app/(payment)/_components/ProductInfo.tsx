import React from "react";

const ProductInfo = ({ className }: { className: string }) => {
  return (
    <div
      className={`flex flex-col justify-between bg-white p-4 max-sm:rounded-none rounded-md min-w-[20rem] shadow ${className}`}
    >
      <section>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <h2 className="text-[14px] font-extrabold text-black">
              סיכום הזמנה
            </h2>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductInfo;
