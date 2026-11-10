import clsx from "clsx";
import { NextImage } from "@/components/ui";
import { categoryColors } from "@/lib/utils";

interface FeedListCardProps {
  item: {
    id: string;
    name: string;
    image: string;
    categoryId?: string;
  };
  idx: number;
  isActive: boolean;
  isStation?: boolean;
  primaryBorderColor: string;
  secondaryBorderColor: string;
  handleActiveItem: (idx: number, itemId: string) => void;
  setItemRef: (el: HTMLDivElement | null, idx: number) => void;
}

const MobileFeedListCard = ({
  item,
  idx,
  isActive,
  isStation = false,
  primaryBorderColor,
  secondaryBorderColor,
  handleActiveItem,
  setItemRef,
}: FeedListCardProps) => {
  return (
    <div
      ref={(el) => setItemRef(el, idx)}
      onClick={() => handleActiveItem(idx, item.id)}
      className={clsx(
        "flex-shrink-0 cursor-pointer transition-all duration-0 rounded-lg overflow-hidden",
        isActive && "ml-2.75 ms-2",
      )}
      style={{
        width: 60,
        height: 60,
        border: `1px solid ${
          isActive
            ? isStation
              ? categoryColors[item.categoryId || ""]
              : primaryBorderColor
            : secondaryBorderColor
        }`,
      }}
    >
      <NextImage
        alt={item?.name}
        imgSrc={item?.image}
        width={200}
        height={200}
        className="object-cover w-full h-full rounded bg-white"
      />
    </div>
  );
};

export default MobileFeedListCard;
