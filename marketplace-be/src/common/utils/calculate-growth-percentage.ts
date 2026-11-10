export const calculateGrowthPercentage = (
  previousCount: number,
  newCount: number,
): number => {
  const percentageIncrease
    = newCount === 0 || previousCount === 0
      ? newCount || previousCount
      : (newCount / previousCount) * 100 || 0;

  return percentageIncrease;
};
