import { BadRequestException } from '@nestjs/common';

/* eslint-disable no-underscore-dangle */
export async function calculateTotalAmount(productsPayload:any, products: any) {
  try {
    console.log(productsPayload, products.data);
    // Calculate the total amount based on the quantity in the payload and the price in the database
    const totalAmount = productsPayload.reduce((sum:number, payloadProduct:any) => {
      const dbProduct = products.data.find((dbProd:any) => dbProd._id.toString() === payloadProduct.id);

      if (dbProduct.quantity.remaining < payloadProduct.quantity) {
        throw new BadRequestException('There is less quantity then you request');
      }
      if (dbProduct) {
        return sum + payloadProduct.quantity * dbProduct.price.sellingPrice;
      }

      return sum;
    }, 0);
    return totalAmount;
  } catch (error) {
    console.error('Error calculating total amount:', error);
    throw error;
  }
}
