"use client";

import clsx from "clsx";
import { categoryGradientClasses } from "@/lib/utils";

interface CardSkeletonProps {
  width?: number;
  height?: number;
  primaryCategoryId: string;
  className?: string | null;
}

const CardSkeleton = ({
  width,
  height,
  primaryCategoryId,
  className = "w-full h-full rounded-2xl",
}: CardSkeletonProps) => {
  return (
    <div
      style={{ width, height }}
      className={clsx(
        "skeleton rounded-2xl",
        className,
        categoryGradientClasses[primaryCategoryId],
      )}
    />
  );
};

export default CardSkeleton;
