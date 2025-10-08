"use client";

import { useState } from "react";
import { IconImage } from "../ui";
import MobileLinkShareBottomDrawer from "./LinkShareBottomDrawer.mobile";

const MobileActionIcons = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  return (
    <>
      <div className="items-center justify-end px-4 max-sm:flex md:hidden">
        <button type="button" onClick={() => setIsDrawerOpen(true)}>
          <IconImage icon={"share"} />
        </button>
      </div>

      {isDrawerOpen && (
        <MobileLinkShareBottomDrawer
          isOpen={isDrawerOpen}
          setIsOpen={setIsDrawerOpen}
        />
      )}
    </>
  );
};

export default MobileActionIcons;
