import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class OnboardingAddressRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(300)
    location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
    city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
    country?: string;
}

export class OnboardingAnswersRequest {
  @ApiProperty({ description: 'What you offer and what a typical visit looks like' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
    offer?: string;

  @ApiProperty({ description: 'What sets you apart (may include the founding story)' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
    edge?: string;

  @ApiProperty({ description: 'Who enjoys it most, and who it suits less' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
    fit?: string;

  @ApiProperty({ description: 'When to come, parking, accessibility, what to bring' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
    practical?: string;

  @ApiProperty({ description: 'One-sentence recommendation from a happy customer' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
    reco?: string;
}

export class OnboardingProductRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
    name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
    description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
    price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
    duration?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
    bookingRequired?: boolean;
}

export class GenerateProfileRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
    businessName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingAddressRequest)
    address?: OnboardingAddressRequest;

  @ApiProperty({ required: false, description: 'Website or Facebook/Instagram page' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
    website?: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => OnboardingAnswersRequest)
    answers: OnboardingAnswersRequest;

  @ApiProperty({ required: false, type: [OnboardingProductRequest] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => OnboardingProductRequest)
    products?: OnboardingProductRequest[];

  @ApiProperty({ required: false, enum: ['he', 'en'] })
  @IsOptional()
  @IsString()
    language?: string;
}
