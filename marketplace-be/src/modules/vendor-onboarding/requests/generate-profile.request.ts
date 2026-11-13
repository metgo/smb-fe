import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { BUSINESS_TAXONOMY } from '../business-taxonomy';

const AREAS = BUSINESS_TAXONOMY.map(g => g.category);
const SUBCATEGORIES = BUSINESS_TAXONOMY.flatMap(g => g.subcategories);

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
  @ApiProperty({ description: '"About us": the story, why it was founded, ideal customers, services, what is special, history' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
    offer?: string;

  @ApiProperty({ description: '"What customers tell their friends": feedback they get, why customers come back' })
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

export class OnboardingCategoryRequest {
  @ApiProperty({ enum: AREAS, description: 'Taxonomy area (canonical English name)' })
  @IsIn(AREAS)
    category: string;

  @ApiProperty({ type: [String], description: 'Subcategories of that area' })
  @IsArray()
  @ArrayMaxSize(20)
  @IsIn(SUBCATEGORIES, { each: true })
    subcategories: string[];
}

export class OnboardingCustomCategoryRequest {
  @ApiProperty({ enum: AREAS })
  @IsIn(AREAS)
    category: string;

  @ApiProperty({ description: "The vendor's own label when nothing in the list fits" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
    label: string;
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

  @ApiProperty({
    required: false,
    type: [OnboardingCategoryRequest],
    description: 'The vendor\'s own category choice (up to 3 areas). When given, the generator keeps it.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => OnboardingCategoryRequest)
    selectedCategories?: OnboardingCategoryRequest[];

  @ApiProperty({ required: false, enum: SUBCATEGORIES, description: 'The starred main activity' })
  @IsOptional()
  @IsIn(SUBCATEGORIES)
    mainSubcategory?: string;

  @ApiProperty({ required: false, type: [OnboardingCustomCategoryRequest] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => OnboardingCustomCategoryRequest)
    customCategories?: OnboardingCustomCategoryRequest[];

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
