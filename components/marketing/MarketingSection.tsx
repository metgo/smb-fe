import React from "react";
import { imagePlayTypeEnum } from "@/lib/utils";
import { ArrowImage, CarouselImage } from "@/components/marketing";

export default async function MarketingSection({
  marketing,
}: {
  marketing: any;
}) {
  if (!marketing?.items?.length) return null;

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
