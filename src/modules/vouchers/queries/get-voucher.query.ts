import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GetVoucherQuery {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
    productId: string;
}
