"use client";

import { useRouter } from "next/navigation";

import { IconImage } from "@/components/ui";
import { misc } from "@/constant/hebrew";

const ReturnToPrevPageBtn = ({ label = misc.return }: { label?: string }) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.back()}
      className="flex flex-shrink-0 items-center gap-1.25 max-sm:px-0 md:pe-14 my-2.5 custom-cursor hover:font-bold"
    >
      <IconImage icon="return-arrow" />
      <span className="text-dark font-normal">{label}</span>
    </div>
  );
};

export default ReturnToPrevPageBtn;
