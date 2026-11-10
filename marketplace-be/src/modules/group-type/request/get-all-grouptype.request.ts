import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';
import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';
import { Purpose } from '../group-type.type';

export class GetAllGroupTypesRequest extends LocaleFilterQuery {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
    campCode: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
    bussCategoryId: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
    bussSubCategoryId: string;

  @ApiProperty({
    type: 'enum',
    enum: Purpose,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(Purpose)
    purpose: Purpose;
}
