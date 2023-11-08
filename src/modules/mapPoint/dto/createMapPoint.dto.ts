import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

export class createMapPointDto {
  @ApiProperty({
    required: true,
  })
    @IsNotEmpty()
    @IsString()
    name: string;

  @ApiProperty({
    required: false,
  })
  @IsNotEmpty()
  @IsString()
    icon: string;

    @ApiProperty({
      required: false,
    })
  @IsOptional()
    @IsBoolean()
      hasMultiple: boolean;
}
