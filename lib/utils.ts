import { category } from "@/constant/hebrew";
import { CtgAttractionIcon, CtgCultureIcon, CtgEatIcon, CtgLocalIcon, CtgLodgeIcon, CtgTourIcon } from "@/components/ui/icons";

export const categories = [
  {
    id: 1,
    icon: CtgTourIcon,
    label: category.tours,
    bg:"bg-ctg-tours-dark"
  },
  {
    id: 2,
    icon: CtgAttractionIcon,
    label: category.attractions,
    bg:"bg-ctg-attract-dark"
  },
  {
    id: 3,
    icon: CtgEatIcon,
    label: category.eater,
    bg:"bg-ctg-eat-dark"
  },
  {
    id: 4,
    icon: CtgCultureIcon,
    label: category.culture,
    bg:"bg-ctg-culture-dark"
  },
  {
    id: 5,
    icon: CtgLodgeIcon,
    label: category.lodge,
    bg:"bg-ctg-lodge-dark"
  },
  {
    id: 6,
    icon: CtgLocalIcon,
    label: category.local,
    bg:"bg-ctg-local-dark"
  }
]