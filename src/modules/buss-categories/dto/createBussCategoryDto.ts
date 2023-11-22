import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class createBussCategoryDto {
      @ApiProperty({
        required: true,
      })
      @IsNotEmpty()
      @IsString()
        name: string;

      @ApiProperty({
        required: true,
      })
      @IsNotEmpty()
      @IsString()
        icon: string;
}
