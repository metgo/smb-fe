import { category } from "@/constant/hebrew";
import { CtgAttractionIcon, CtgCultureIcon, CtgEatIcon, CtgLodgeIcon, CtgTourIcon } from "@/components/ui/icons";

export const categories = [
  {
    id: 1,
    icon: CtgTourIcon,
    label: category.tours
  },
  {
    id: 2,
    icon: CtgAttractionIcon,
    label: category.attractions
  },
  {
    id: 3,
    icon: CtgEatIcon,
    label: category.eater
  },
  {
    id: 4,
    icon: CtgCultureIcon,
    label: category.culture
  },
  {
    id: 5,
    icon: CtgLodgeIcon,
    label: category.lodge
  },
  {
    id: 6,
    icon: CtgLodgeIcon,
    label: category.local
  }
]