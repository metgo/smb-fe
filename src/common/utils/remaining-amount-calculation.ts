export const remainingAmountCalculation = (
  totalAmount: number,
  toDeductAmount: number,
) => Math.max(0, totalAmount - toDeductAmount);
