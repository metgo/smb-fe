"use client";

import { useRouter } from "next/navigation";

import { IconImage } from "@/components/ui";
import { misc } from "@/constant/hebrew";

const ReturnToPrevPageBtn = ({ label = misc.return }: { label?: string }) => {
  const router = useRouter();

  return (
    <>
      <div
        onClick={() => router.back()}
        className="flex items-center gap-1.25 max-sm:mt-30 max-sm:px-4 md:px-20 my-2.5 custom-cursor"
      >
        <IconImage icon="return-arrow" />
        <span className="text-dark font-normal">{label}</span>
      </div>
      <hr className="h-[1px] text-primary" />
    </>
  );
};

export default ReturnToPrevPageBtn;
