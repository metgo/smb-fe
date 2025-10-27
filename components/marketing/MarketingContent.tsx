import Link from "next/link";
import { misc } from "@/constant/hebrew";
import clsx from "clsx";

type ContentType = {
  link: string;
  title: string;
  description: string;
};

const MarketingContent = ({
  content,
  scale,
}: {
  content: ContentType;
  scale: number;
}) => {
  return (
    <div
      className={clsx(
        "absolute max-sm:top-[20%] md:top-[55%] max-sm:right-10 md:right-32 md:-translate-y-1/2 z-30 md:w-1/2 max-sm:w-[80%]",
      )}
    >
      <div className="text-white font-bold max-sm:mb-16 md:mb-10">
        <h1
          style={{ fontSize: 60 * scale }}
          className=" max-sm:leading-14 md:leading-19 max-sm:mb-4 md:mb-3"
        >
          {/* max-sm:text-6xl md:text-[80px] */}
          {content?.title}
        </h1>
        <p style={{ fontSize: 24 * scale }}>{content?.description}</p>
      </div>
      <Link
        href={content?.link}
        target="_blank"
        className="custom-cursor  border border-lightGray bg-white/90 backdrop-blur-sm max-sm:px-6 md:px-10 max-sm:py-3 md:py-5 rounded-lg font-semibold text-theme hover:bg-white hover:scale-105 transition-all duration-300 shadow-xl font-bold"
      >
        {misc.forMoreDetails}
      </Link>
    </div>
  );
};

export default MarketingContent;
