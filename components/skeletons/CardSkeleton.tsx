import clsx from "clsx";
import { categoryGradientClasses } from "@/lib/utils";

interface CardSkeletonProps {
  primaryCategoryId: string;
  className?: string | null;
}

const CardSkeleton = ({
  primaryCategoryId,
  className = "w-full h-full rounded-2xl",
}: CardSkeletonProps) => {
  return (
    <div
      className={clsx(
        "skeleton",
        className,
        categoryGradientClasses[primaryCategoryId],
      )}
    />
  );
};

export default CardSkeleton;
