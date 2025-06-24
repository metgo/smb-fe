import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetAllBusinessesForMapRequest {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
    campCode: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
    search: string;

  @ApiProperty({
    required: false,
    isArray: true,
    type: String,
  })
  @IsOptional()
    groupTypesId: string[];

  @ApiProperty({
    required: false,
    isArray: true,
    type: String,
  })
  @IsOptional()
    accessibilitiesId: string[];

  @ApiProperty({
    required: false,
    type: String,
  })
  @IsOptional()
    bussCategoriesId: string;

  @ApiProperty({
    required: false,
    type: String,
  })
  @IsOptional()
    bussSubCategoriesId: string;
}
