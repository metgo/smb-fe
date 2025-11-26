import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteItemFromCartDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    productId: string;
}
