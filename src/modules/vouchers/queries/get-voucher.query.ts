import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class GetVoucherQuery {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    productId: string;
}
