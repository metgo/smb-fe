import { category } from "@/constant/hebrew";
import { create } from "zustand";

type Category = {
  id: string;
  name: string;
  icon: string;
  activeIcon: string;
};

interface CategoryStoreState {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
}

const initialCategory = [
  {
    id: "6566e256a77d2a477266d2c0",
    name: category.tours,
    icon: "travel",
    activeIcon: "travel-active",
  },
  {
    id: "6566e31ca77d2a477266d2d6",
    name: category.attractions,
    icon: "attractions",
    activeIcon: "attractions-active",
  },
  {
    id: "6566e3aaa77d2a477266d314",
    name: category.eater,
    icon: "food",
    activeIcon: "food-active",
  },
  {
    id: "6566e36ba77d2a477266d2f4",
    name: category.culture,
    icon: "culture",
    activeIcon: "culture-active",
  },
  {
    id: "6566fcd4a77d2a477266d3b9",
    name: category.lodge,
    icon: "sleep",
    activeIcon: "sleep-active",
  },
  // {
  //   id: "6566fd7fa77d2a477266d3ca",
  //   name: "",
  //   icon: "local",
  //   activeIcon: "local-active",
  // },
];
const useCategoryStore = create<CategoryStoreState>((set) => ({
  categories: initialCategory,
  setCategories: (categories: Category[]) => set({ categories }),
}));

export default useCategoryStore;
