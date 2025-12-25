"use client";

import { imagePlayTypeEnum } from "@/lib/utils";
import { ArrowImage, CarouselImage } from "@/components/marketing";
import { useQuery } from "@tanstack/react-query";
import { getMarketing } from "@/actions/marketingAction";

export default async function MarketingSection() {
  const { data: marketing } = useQuery({
    queryKey: ["marketing"],
    queryFn: getMarketing,
  });

  return (
    <>
      {marketing.playType === imagePlayTypeEnum.manual ? (
        <ArrowImage images={marketing.items} />
      ) : (
        <CarouselImage
          images={marketing.items}
          timeInterval={marketing.timeInterval}
        />
      )}
    </>
  );
}
