"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { pathNames } from "@/lib/endpoints";
import { staticImages } from "@/constant/staticImages";
import { getPromotionsList } from "@/actions/commonActions";
import { startLoading } from "./wrappers/ProgressBar";
import { removeInlineStylesFromHTML } from "@/lib/helpers";
import { ReturnToPrevPageBtn } from "@/app/(details)/_components";

const PromotionalCards = () => {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const slug = params?.slug;
  const [promotions, setPromotions] = useState<any>([]);
  const [filteredPromotions, setFilteredPromotions] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await getPromotionsList();
      setPromotions(res?.allPromotionalItems);
    })();
  }, []);

  useEffect(() => {
    if (slug && promotions) {
      const filteredItems = promotions?.filter(
        (item: any) => item.slug !== params?.slug,
      );
      setFilteredPromotions(filteredItems);
    }
  }, [slug, promotions]);

  const handleNavigate = (slug: string) => {
    startLoading();
    router.push(`${pathNames.businessDetails}/${slug}`);
  };

  //  pages where this component should show
  const shouldShow =
    pathname === pathNames.contactUs ||
    pathname.startsWith(pathNames.blogArticleDetails) ||
    pathname.startsWith(pathNames.productsDetails) ||
    pathname.startsWith(pathNames.trailDetails) ||
    pathname === pathNames.cart ||
    pathname.startsWith(pathNames.businessDetails);

  if (!shouldShow) return null;

  return (
    <section className="flex items-center max-sm:gap-3 z-50 bg-white mt-4 overflow-hidden">
      <ReturnToPrevPageBtn />
      {filteredPromotions?.length > 0 && (
        <div
          dir="ltr"
          className="w-full flex-shrink-0 flex items-center justify-start overflow-hidden"
        >
          <div className="flex gap-x-4 h-full animate-seamless-infinite-scroll whitespace-nowrap items-center">
            {Array(40)
              .fill(filteredPromotions)
              .flat()
              .map((item, idx) => (
                <div
                  key={`${item?._id}-${idx}`}
                  onClick={() => handleNavigate(item?.slug)}
                  className="flex items-center gap-2 whitespace-nowrap flex-shrink-0 custom-cursor border border-transparent hover:shadow-md hover:border-gray-200 px-2 py-1 rounded-md transition-colors"
                >
                  <div dir="rtl" className=" max-w-[120px]">
                    <h3
                      className="font-bold text-gray-800 -mb-2 truncate"
                      title={item?.name}
                    >
                      {item?.name?.length > 20
                        ? `${item.name.slice(0, 20)}...`
                        : item.name}
                    </h3>

                    <div
                      dangerouslySetInnerHTML={{
                        __html: removeInlineStylesFromHTML(item?.description),
                      }}
                      className="line-clamp-1 font-bold text-[12px] w-20"
                    />
                  </div>
                  <div className="w-[36px] h-[36px]">
                    <Image
                      src={item?.image?.image || staticImages.placeholder}
                      alt={item?.image?.alt || item?.name}
                      width={36}
                      height={36}
                      className="rounded object-cover w-[36px] h-[36px]"
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default PromotionalCards;
