import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ProductDto } from './product.dto';

export class WebCreateProduct extends ProductDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
    userId: string;
}
