import React, { useEffect, useState } from "react";
import TrailStations from "../_components/TrailStations";

interface MobileTrailStationsProps {
  _id: string;
  isOpen: boolean;
  stations: TrailStationProps[];
  setIsOpen: (v: boolean) => void;
}

const MobileTrailStationsSheet = ({
  _id,
  isOpen,
  setIsOpen,
  stations,
}: MobileTrailStationsProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div>
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 max-sm:block md:hidden ${
          isVisible ? "bg-opacity-50" : "bg-opacity-0"
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleClose();
        }}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg bg-white rounded-t-2xl shadow-lg transform transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <TrailStations _id={_id} stations={stations} />
      </div>
    </div>
  );
};

export default MobileTrailStationsSheet;
