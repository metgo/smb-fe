import clsx from "clsx";
import Link from "next/link";

import IconImage from "./IconImage";
import { misc } from "@/constant/hebrew";

interface MapNavButtonProps {
  lat: string;
  lng: string;
  clssName?: string;
}

const MapNavButton = ({ lat, lng, clssName = "" }: MapNavButtonProps) => {
  return (
    <Link
      target="_blank"
      rel="noopener noreferrer"
      href={`https://www.google.com/maps/search/?api=1&query=${lat + "," + lng}`}
      className={clsx(
        clssName,
        "flex flex-col items-center gap-1.25 ps-2.5 pe-4 py-1 custom-cursor",
      )}
    >
      <IconImage icon={"navigation"} />
      <span className="font-bold text-theme text-sm">{misc.navigation}</span>
    </Link>
  );
};

export default MapNavButton;
