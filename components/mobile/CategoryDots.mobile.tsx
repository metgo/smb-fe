import { categoryColors } from "@/lib/utils";
import clsx from "clsx";

interface Props {
  categories: any[];
  activeCategoryKey: string;
}

const CategoryDots = ({ categories, activeCategoryKey }: Props) => (
  <div className="flex justify-center my-4">
    <div className="flex w-[125px] h-[10px] justify-between items-center rounded-lg p-1 bg-white">
      {categories.map((item) => {
        const isActive = item.id === activeCategoryKey;
        const activeColor = isActive ? categoryColors[item.id] : "#FBFBFB";

        return (
          <div
            key={item.id}
            style={{ backgroundColor: activeColor }}
            className={clsx("w-[25px] h-[8px]", {
              "rounded-md": isActive,
            })}
          />
        );
      })}
    </div>
  </div>
);
export default CategoryDots;
