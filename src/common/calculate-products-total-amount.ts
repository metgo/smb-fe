import { BadRequestException } from '@nestjs/common';
import { ServerErrors } from 'src/common/constant';

export async function calculateProductsTotalAmount(
  productsPayload: any,
  products: any,
) {
  try {
    // Calculate the total amount based on the quantity in the payload and the price in the database
    const totalAmount = productsPayload.reduce(
      (sum: number, payloadProduct: any) => {
        const dbProduct = products.data.find(
          (dbProd: any) => dbProd._id.toString() === payloadProduct.id,
        );

        if (!Number(payloadProduct?.quantity)) {
          throw new BadRequestException(ServerErrors.INVALID_QUANTITY);
        }
        if (dbProduct.quantity.remaining < payloadProduct.quantity) {
          throw new BadRequestException(
            'There is less quantity then you request',
          );
        }
        if (dbProduct) {
          return sum + payloadProduct.quantity * dbProduct.price.sellingPrice;
        }

        return sum;
      },
      0,
    );
    return totalAmount;
  } catch (error) {
    throw new BadRequestException(error);
  }
}
