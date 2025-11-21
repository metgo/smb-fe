import { emptyStateText } from "@/constant/hebrew";
import clsx from "clsx";

const NoFeedItemLayout = ({
  isFilterDrawerOpen = false,
}: {
  isFilterDrawerOpen?: boolean;
}) => {
  return (
    <div className="relative w-full h-[92vh] flex items-center justify-center">
      <p
        className={clsx(
          "font-bold text-2xl max-w-[38rem] text-center text-theme",
          isFilterDrawerOpen && "ms-[30%]",
        )}
      >
        {emptyStateText.noBusiness}
      </p>
    </div>
  );
};

export default NoFeedItemLayout;
