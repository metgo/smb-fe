import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
  ArrayNotEmpty,
  IsOptional,
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
    cluster: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
    address: string;

  @ApiProperty({ type: String })
  @IsEmail()
  @IsNotEmpty()
    email: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
    contactName: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
    contactPhone: string;

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

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
    marketingDescription: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
    targetAudience: string[];

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
    operatingHours: string;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @ToBoolean()
  @IsNotEmpty()
    hasImmediateAvailability: boolean;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @ToBoolean()
  @IsNotEmpty()
    interestedInOnlineSales: boolean;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
    revenueImpact: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
    revenueImpactOther: string;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @ToBoolean()
  @IsNotEmpty()
    declarationReadDocs: boolean;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @ToBoolean()
  @IsNotEmpty()
    declarationNoRestrictions: boolean;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @ToBoolean()
  @IsNotEmpty()
    declarationHasPermits: boolean;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @ToBoolean()
  @IsNotEmpty()
    declarationHasFirstAid: boolean;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @ToBoolean()
  @IsNotEmpty()
    declarationNoLegalProceedings: boolean;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @ToBoolean()
  @IsNotEmpty()
    declarationTaxCompliant: boolean;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @ToBoolean()
  @IsNotEmpty()
    declarationAcceptsTerms: boolean;
}
