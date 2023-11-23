export const spForDiscountAmount = (MP: number, discountAmount: number) => (MP - discountAmount);

export const spForDiscountPercent = (MP: number, discountPercent: number) => (
  MP - (MP * discountPercent) / 100
);

export const sellingPriceForAmountOrPercent = (MP: number, amount: number, percent: number) => {
  if (amount) {
    return spForDiscountAmount(MP, amount);
  }
  if (percent) {
    return spForDiscountPercent(MP, percent);
  }

  return MP;
};
