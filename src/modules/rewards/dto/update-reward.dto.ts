import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class UpdateRewardDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
    amount: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
    voucherLimit: number;
}
