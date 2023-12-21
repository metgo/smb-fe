import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

import { AmountRange } from 'src/core/decorators/range.decorator';

export class UpdateVoucherBalance {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    voucherId: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @AmountRange(1, 5000, { message: 'Amount should be between 1 and 5000' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
    amount: number;
}
