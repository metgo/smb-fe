"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { pathNames } from "@/lib/endpoints";
import { staticImages } from "@/constant/staticImages";
import { getPromotionsList } from "@/actions/commonActions";
import { startLoading } from "./wrappers/ProgressBar";
import { removeInlineStylesFromHTML } from "@/lib/helpers";
import { ReturnToPrevPageBtn } from "@/app/(details)/_components";

const PromotionalCards = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [promotions, setPromotions] = useState<any>([]);
  console.log(" ~:", promotions);

  useEffect(() => {
    async function fetchData() {
      const res = await getPromotionsList();
      setPromotions(res);
    }
    fetchData();
  }, []);

  function handleNavigate(slug: string) {
    startLoading();
    router.push(`${pathNames.businessDetails}/${slug}`);
  }

  if (
    pathname === pathNames.contactUs ||
    pathname.startsWith(pathNames.blogArticleDetails) ||
    pathname.startsWith(pathNames.productsDetails) ||
    pathname.startsWith(pathNames.trailDetails) ||
    pathname === pathNames.cart ||
    pathname.startsWith(pathNames.businessDetails)
  )
    return (
      <section className="flex items-center max-sm:gap-3 z-50 bg-white mt-4">
        <ReturnToPrevPageBtn />
        {promotions?.allPromotionalItems?.length > 0 && (
          <div className="max-sm:w-68 md:w-[92%] flex-shrink-0 flex items-center justify-center overflow-hidden">
            <div className="flex gap-x-4 h-full flex-row-reverse animate-seamless-infinite-scroll whitespace-nowrap items-center">
              {Array(20)
                ?.fill(promotions?.allPromotionalItems)
                ?.flat()
                ?.map((item, idx) => (
                  <div
                    key={`${item?._id}-${idx}`}
                    onClick={() => handleNavigate(item?.slug)}
                    className="flex items-center gap-2 whitespace-nowrap flex-shirnk-0 custom-cursor border border-transparent hover:shadow-md hover:border-gray-200 px-2 py-1 rounded-md transition-colors"
                  >
                    <div className="w-[36px] h-[36px]">
                      <Image
                        src={item?.image?.image || staticImages.placeholder}
                        alt={item?.image?.alt || item?.name}
                        width={36}
                        height={36}
                        className="rounded object-cover w-[36px] h-[36px]"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 -mb-2">
                        {item?.name}
                      </h3>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: removeInlineStylesFromHTML(item?.description),
                        }}
                        className="line-clamp-1 font-bold text-[12px] w-20"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </section>
    );

  return null;
};

export default PromotionalCards;
