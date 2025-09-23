"use client";

import { ReactNode, useEffect } from "react";
import { getAminitiesInfo } from "@/actions/commonActions";
import useGeneralStore from "@/stores/generalStore";

export const SiteInfoClientProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { setAminitiesInfo } = useGeneralStore();

  useEffect(() => {
    async function fetchAminitiesInfo() {
      const res = await getAminitiesInfo();
      setAminitiesInfo(res);
    }
    fetchAminitiesInfo();
  }, []);

  return <div>{children}</div>;
};
