import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ProductDto } from './product.dto';

export class WebCreateProduct extends ProductDto {
  @ApiProperty({
    required: true,
  })
  @IsOptional()
  @IsString()
    userId: string;
}
