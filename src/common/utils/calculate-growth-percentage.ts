export const calculateGrowthPercentage = (previousCount: number, newCount: number): number => {
  const difference = newCount - previousCount;

  const percentageIncrease = (Math.abs(difference / previousCount)) * 100 || 0;

  return percentageIncrease;
};
