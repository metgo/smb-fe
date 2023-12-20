import { ApiProperty } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty,
} from 'class-validator';
import { CommonFilterQuery } from 'src/common/utils/common-filter-query';

export class ExternalApiFilterQuery extends CommonFilterQuery {
    @ApiProperty({ type: String, required: true })
    @IsString()
    @IsNotEmpty()
      identifierId: string;
}
