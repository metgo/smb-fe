"use client";

import { useRouter } from "next/navigation";
import { FaArrowRightLong } from "react-icons/fa6";

import { emptyStateText, misc } from "@/constant/hebrew";

const NoDetailsFound = () => {
  const router = useRouter();

  return (
    <section className="w-full h-[60vh] flex items-center justify-center bg-primary">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-4xl">{emptyStateText.noDetails}</h1>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 rounded-lg border bg-dark text-white cursor-pointer flex items-center gap-2.5"
        >
          <FaArrowRightLong />
          <span>{misc.return}</span>
        </button>
      </div>
    </section>
  );
};

export default NoDetailsFound;
