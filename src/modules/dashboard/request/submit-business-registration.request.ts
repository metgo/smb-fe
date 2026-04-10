import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
  ArrayNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ToBoolean } from 'src/core/decorators/to-boolean.decorator';

export class SubmitBusinessRegistrationRequest {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
    businessName: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
    idNumber: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
    businessDescription: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
    address: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
    landlinePhone: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
    fax: string;

  @ApiProperty({ type: String })
  @IsEmail()
  @IsNotEmpty()
    email: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
    contactName: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsNotEmpty()
    contactPhone: number;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @ToBoolean()
  @IsNotEmpty()
    isPrimaryIncome: boolean;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
    categories: string[];
}
