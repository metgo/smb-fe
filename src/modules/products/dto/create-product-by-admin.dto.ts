import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { ProductDto } from 'src/modules/products/dto';

export class CreateProductByAdmin extends ProductDto {
  @ApiProperty({
    required: true,
  })
  @IsOptional()
  @IsString()
    userId: string;
}
