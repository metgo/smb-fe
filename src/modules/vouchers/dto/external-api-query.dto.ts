import { ApiProperty } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty,
} from 'class-validator';

import { FilterQuery } from './query.dto';

export class ExternalApiFilterQuery extends FilterQuery {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
    identifierId: string;
}
