import { BadRequestException } from '@nestjs/common';
import { ServerErrors } from 'src/common/constant';

export async function calculateProductsTotalAmount(
  productsPayload: any,
  productsFromDB: any,
) {
  try {
    const cartItems = [];
    // Calculate the total amount based on the quantity in the payload and the price in the database
    const actualAmountOfProduct = productsPayload.reduce(
      (sum: number, payloadProduct: any) => {
        const dbProduct = productsFromDB.find(
          (dbProd: any) => dbProd._id?.toString() === payloadProduct.id.toString(),
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
          cartItems.push({
            id: payloadProduct.id,
            quantity: payloadProduct.quantity,
            amount: dbProduct?.price?.sellingPrice,
            email: payloadProduct.email,
            countryCode: payloadProduct.countryCode,
            phone: payloadProduct.phone,
            firstName: payloadProduct.firstName,
            lastName: payloadProduct.lastName,
            deliveryMethod: payloadProduct.deliveryMethod,
            deliveryArea: payloadProduct.deliveryArea,
            deliveryPickupLocation: payloadProduct.deliveryPickupLocation,
            houseNo: payloadProduct.houseNo,
            apartment: payloadProduct.apartment,
            city: payloadProduct.city,
            street: payloadProduct.street,
            isGift: payloadProduct.isGift,
            additionalInfo: payloadProduct.additionalInfo,
          });
          return sum + payloadProduct.quantity * dbProduct.price.sellingPrice;
        }

        return sum;
      },
      0,
    );

    return { actualAmountOfProduct, cartItems };
  } catch (error) {
    throw new BadRequestException(error);
  }
}
