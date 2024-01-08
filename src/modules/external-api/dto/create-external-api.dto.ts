import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

export class CreateExternalApiDTO {
    @ApiProperty({
      required: true,
    })
    @IsString()
    @IsNotEmpty()
      companyName: string;

    @ApiProperty({
      required: true,
    })
    @IsEmail()
    @IsNotEmpty()
      companyEmail: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
      companyPhone: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
      companyAddress: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
      ipAddress: string;
}
