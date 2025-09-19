import Link from "next/link";
import { misc } from "@/constant/hebrew";

type ContentType = {
  link: string;
  title: string;
  description: string;
};

const MarketingContent = ({ content }: { content: ContentType }) => {
  return (
    <div className="absolute top-[55%] right-32 -translate-y-1/2 z-30 w-1/2">
      <div className="text-white font-bold mb-10">
        <h1 className=" text-[80px] leading-19 mb-3">{content?.title}</h1>
        <p className="">{content?.description}</p>
      </div>
      <Link
        href={content?.link}
        target="_blank"
        className="custom-cursor  border border-lightGray bg-white/90 backdrop-blur-sm px-10 py-5 rounded-lg font-semibold text-gray-800 hover:bg-white hover:scale-105 transition-all duration-300 shadow-xl font-bold"
      >
        {misc.forMoreDetails}
      </Link>
    </div>
  );
};

export default MarketingContent;
