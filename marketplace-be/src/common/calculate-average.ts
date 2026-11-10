import { BadRequestException } from '@nestjs/common';

export async function calculateAverage(totalSum: number, totalNumber: number) {
  try {
    const average = totalSum / totalNumber;

    return average;
  } catch (error) {
    throw new BadRequestException(error);
  }
}
