import { BadRequestException } from '@nestjs/common';
import { ServerErrors } from 'src/common/constant';
import {
  CartProductPayload,
  CartProductResponse,
} from 'src/modules/cart/cart.types';

export async function calculateProductsTotalAmount(
  productsPayload: CartProductPayload[],
  productsFromDB: any,
): Promise<{
  payableAmount: number;
  totalDeliveryFee: number;
  cartItems: CartProductResponse[];
}> {
  try {
    const cartItems: CartProductResponse[] = productsPayload
      .map((payloadProduct: CartProductPayload) => {
        const dbProduct = productsFromDB.find(
          (dbProd: any) => dbProd._id?.toString() === payloadProduct.id.toString(),
        );

        if (!Number(payloadProduct?.quantity)) {
          throw new BadRequestException(ServerErrors.INVALID_QUANTITY);
        }
        if (
          dbProduct?.quantity?.remaining < payloadProduct?.quantity
          && !dbProduct?.quantity?.isUnlimited
        ) {
          throw new BadRequestException(
            'There is less quantity than you requested',
          );
        }

        if (dbProduct) {
          return {
            id: payloadProduct.id,
            quantity: payloadProduct.quantity,
            amount: dbProduct.price.sellingPrice,
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
            deliveryFee: payloadProduct?.deliveryFee || 0,
            itemType: payloadProduct?.itemType,
          };
        }

        return null;
      })
      .filter(Boolean);

    const payableAmount = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.amount + item.deliveryFee,
      0,
    );

    const totalDeliveryFee = cartItems.reduce(
      (sum, item) => sum + item.deliveryFee,
      0,
    );

    return { payableAmount, cartItems, totalDeliveryFee };
  } catch (error) {
    throw new BadRequestException(error);
  }
}
