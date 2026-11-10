import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty, IsNumber, IsOptional, IsString,
} from 'class-validator';

export class createVoucherTemplateDto {
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
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
    amount: number;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
    campCode: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
    description: string;

  @ApiProperty({
    required: true,
  })
  @IsOptional()
  @IsString()
    campId: string;
}
