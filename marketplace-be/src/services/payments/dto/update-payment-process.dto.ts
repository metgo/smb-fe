import {
  IsEnum, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from 'src/common/enum';

export class UpdatePaymentProcessDto {
  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  @ApiProperty({
    type: 'enum',
    enum: PaymentStatus,
    required: true,
  })
    status: PaymentStatus;

  @IsOptional()
  @IsString()
  @ApiProperty()
    failure_reason: string;
}
