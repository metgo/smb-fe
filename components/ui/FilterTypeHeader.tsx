import { FC } from "react";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";

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
      className="flex justify-between items-center custom-cursor pb-4 w-full mt-4"
    >
      <div className="text-[16px] font-bold text-black">{title}</div>
      {activeTitle ? (
        <RiArrowUpSLine size={24} className="text-theme" />
      ) : (
        <RiArrowDownSLine size={24} className="text-theme" />
      )}
    </div>
  );
};
export default FilterTypeHeader;
