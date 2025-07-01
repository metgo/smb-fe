"use client";

import { useRouter } from "next/navigation";

import { IconImage } from "@/components/ui";
import { misc } from "@/constant/hebrew";

const ReturnToPrevPageBtn = () => {
  const router = useRouter();

  return (
    <>
      <div
        onClick={() => router.back()}
        className="flex items-center gap-1.25 px-20 my-2.5 cursor-pointer"
      >
        <IconImage icon="return-arrow" />
        <span className="text-dark ">{misc.return}</span>
      </div>
      <hr className="h-[1px] text-primary" />
    </>
  );
};

export default ReturnToPrevPageBtn;
