import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PromoDetailDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    promoName: string;
}
