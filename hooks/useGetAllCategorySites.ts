import { useQuery } from "@tanstack/react-query";
import { getAllCategorySites } from "@/actions/categoryActions";

export const useGetAllCategorySites = () => {
  return useQuery({
    queryKey: ["category-sites"],
    queryFn: getAllCategorySites,
  });
};
