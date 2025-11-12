import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class GetVoucherByCodeQuery {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
    identifierId: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    productId: string;
}
