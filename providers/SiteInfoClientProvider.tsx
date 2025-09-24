"use client";

import { ReactNode, useEffect } from "react";
import useGeneralStore from "@/stores/generalStore";
import { getAminitiesInfo } from "@/actions/commonActions";

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
