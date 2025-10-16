import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

import { HeartIcon, NavIcon, ShareIcon } from "../ui/svgIcons";
import MobileLinkShareBottomDrawer from "./LinkShareBottomDrawer.mobile";

interface MobileFeedScreenActionIconsProps {
  trailInfo?: string;
  hideThreedotIcon?: boolean;
  strokColor?: string;
  geoLocation?: { lat: number | string; long: number | string };
}

const MobileFeedScreenActionIcons = ({
  geoLocation,
  trailInfo,
  strokColor,
  hideThreedotIcon = false,
}: MobileFeedScreenActionIconsProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <div
        className={clsx(
          " absolute top-40 right-4 left-4 mx-auto flex justify-between text-white z-20",
          hideThreedotIcon && "flex-row-reverse",
        )}
      >
        {!hideThreedotIcon && <BsThreeDotsVertical size={30} />}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <HeartIcon strokColor={strokColor} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDrawerOpen(true);
            }}
          >
            <ShareIcon strokColor={strokColor} />
          </button>
          {geoLocation && (
            <Link
              target="_blank"
              data-no-swipe
              rel="noopener noreferrer"
              href={`https://www.google.com/maps/search/?api=1&query=${geoLocation.lat},${geoLocation.long}`}
              className="custom-cursor"
              onClick={(e) => e.stopPropagation()}
            >
              <NavIcon strokColor={strokColor} />
            </Link>
          )}
        </div>
      </div>

      {isDrawerOpen && (
        <MobileLinkShareBottomDrawer
          trailInfo={trailInfo}
          isOpen={isDrawerOpen}
          setIsOpen={setIsDrawerOpen}
        />
      )}
    </>
  );
};

export default MobileFeedScreenActionIcons;
