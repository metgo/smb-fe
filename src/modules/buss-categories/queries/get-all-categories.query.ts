import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';

export class GetAllCategoriesQuery extends LocaleFilterQuery {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
    campCode: string;
}
