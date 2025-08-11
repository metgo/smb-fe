"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon } from "@/components/ui/icons";
import clsx from "clsx";

const QuantityUpdateBtns = () => {
  const canIncrease = true;
  const [qty, setQty] = useState(1);

  function handleIncrease() {
    setQty((prev) => prev + 1);
  }
  function handleDecrease() {
    setQty((prev) => prev - 1);
  }

  return (
    <div className="flex items-center border h-[40px] rounded-lg bg-white border-gray w-max my-6">
      <button
        type="button"
        onClick={handleIncrease}
        className={clsx(
          "w-10 h-[36px] mr-1 flex items-center justify-center text-gray-700 font-bold rounded-full hover:bg-gray-200 transition",
          !canIncrease ? "cursor-not-allowed" : "cursor-pointer",
        )}
      >
        <PlusIcon />
      </button>
      <div className="flex items-center justify-center w-[36px] h-[36px] text-[18px] rounded-full font-semibold">
        {qty}
      </div>
      <button
        type="button"
        onClick={handleDecrease}
        disabled={qty === 1}
        className={clsx(
          "w-10 h-[36px] flex items-center justify-center text-gray-700 font-bold rounded-full hover:bg-gray-200 transition",
          qty === 1 ? "cursor-not-allowed" : "cursor-pointer",
        )}
      >
        <MinusIcon />
      </button>
    </div>
  );
};

export default QuantityUpdateBtns;
