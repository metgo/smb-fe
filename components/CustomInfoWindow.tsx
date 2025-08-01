"use client";

import { useEffect, useState } from "react";
import { getLocationDetailsById } from "@/actions/commonActions";

const CustomInfoWindow = ({ stationId }: { stationId: string }) => {
  const [stationDetails, setStationDetails] = useState();

  useEffect(() => {
    if (stationId) {
      async function fetchStationDetails() {
        const res = await getLocationDetailsById(stationId);
        setStationDetails(res);
      }
      fetchStationDetails();
    }
  }, [stationId]);

  console.log("----stationDetails", stationDetails);
  return (
    <div className="w-[200px] h-[200px] rounded-md bg-white relative">
      <div></div>
    </div>
  );
};

export default CustomInfoWindow;
