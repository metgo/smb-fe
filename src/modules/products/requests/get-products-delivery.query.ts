import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetProductsDeliveryRequest {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
    campCode: string;

  @ApiProperty({
    required: true,
    isArray: true,
    type: String,
  })
  @IsNotEmpty()
    id: string[];
}
