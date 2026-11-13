import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

export class CreateBusinessRequest {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  @IsString()
    nameHe: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  @IsString()
    contactName: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
    shortDescriptionHe?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
    phoneNumber?: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  @IsEmail()
    busiEmail: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  @IsString()
    primaryCategoryId: string;

  @ApiProperty({
    type: String,
    required: true,
    description: 'Website identifier ID',
  })
  @IsNotEmpty()
  @IsString()
    identifierId: string;
}
