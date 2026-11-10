import { BadRequestException } from '@nestjs/common';

export async function calculateTotalAmount(reference: string, data: any[]) {
  try {
    const totalAmount = data.reduce(
      (sum: number, payload: any) => sum + payload[reference],
      0,
    );

    return totalAmount;
  } catch (error) {
    throw new BadRequestException(error);
  }
}
