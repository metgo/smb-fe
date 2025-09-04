import { FC } from "react";
import { UpArrow } from "./icons";

interface FilterTypeHeaderProps {
  title: string;
  activeTitle: boolean;
  setActiveTitle: (title: boolean) => void;
}

const FilterTypeHeader: FC<FilterTypeHeaderProps> = ({
  title,
  setActiveTitle,
  activeTitle,
}) => {
  return (
    <div
      onClick={() => setActiveTitle(!activeTitle)}
      className="flex justify-between items-center cursor-pointer pb-4"
    >
      <div className="text-[16px] font-bold text-black">{title}</div>
      <UpArrow
        className={`${!activeTitle ? "-rotate-180" : ""} text-black opacity-50 text-xl`}
      />
    </div>
  );
};
export default FilterTypeHeader;
