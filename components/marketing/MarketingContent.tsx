import Link from "next/link";
import { misc } from "@/constant/hebrew";

type ContentType = {
  link: string;
  title: string;
  description: string;
};

const MarketingContent = ({ content }: { content: ContentType }) => {
  return (
    <div className="absolute top-[55%] max-sm:right-10 md:right-32 -translate-y-1/2 z-30 md:w-1/2 max-sm:w-[80%]">
      <div className="text-white font-bold mb-10">
        <h1 className="max-sm:text-4xl md:text-[80px] max-sm:leading-8 md:leading-19 mb-3">
          {content?.title}
        </h1>
        <p className="">{content?.description}</p>
      </div>
      <Link
        href={content?.link}
        target="_blank"
        className="custom-cursor  border border-lightGray bg-white/90 backdrop-blur-sm max-sm:px-6 md:px-10 max-sm:py-3 md:py-5 rounded-lg font-semibold text-gray-800 hover:bg-white hover:scale-105 transition-all duration-300 shadow-xl font-bold"
      >
        {misc.forMoreDetails}
      </Link>
    </div>
  );
};

export default MarketingContent;
