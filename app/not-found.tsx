"use client";

import { emptyStateText, misc } from "@/constant/hebrew";
import { useRouter } from "next/navigation";
import { FaArrowRightLong } from "react-icons/fa6";

export default function NotFound() {
  const router = useRouter();
  return (
    <section className="w-full h-screen flex items-center justify-center bg-primary">
      <div className="flex flex-col items-center gap-8">
        <p className="font-bold text-2xl max-w-[38rem] text-center text-theme">
          {emptyStateText.noBusiness}
        </p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 rounded-lg border bg-dark text-white custom-cursor flex items-center gap-2.5"
        >
          <FaArrowRightLong />
          <span>{misc.return}</span>
        </button>
      </div>
    </section>
  );
}
