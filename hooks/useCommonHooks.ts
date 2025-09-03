import { usePathname } from "next/navigation";

export const useCommonHook = () => {
  const pathname = usePathname();

  function isCurrentPage(targetPath: string) {
    return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
  }

  return {
    isCurrentPage,
  };
};
