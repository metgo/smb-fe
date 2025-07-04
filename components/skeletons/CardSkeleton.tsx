import { categoryGradientClasses } from "@/lib/utils";

const CardSkeleton = ({ primaryCategoryId }: { primaryCategoryId: string }) => {
  return (
    <div
      className={`rounded-2xl skeleton w-full h-full ${categoryGradientClasses[primaryCategoryId]}`}
    />
  );
};

export default CardSkeleton;
