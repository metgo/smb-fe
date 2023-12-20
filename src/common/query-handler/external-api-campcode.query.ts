import { ApiProperty } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty,
} from 'class-validator';
import { ExternalApiFilterQuery } from './external-api-filter.query';

export class ExternalApiWithCampCodeFilterQuery extends ExternalApiFilterQuery {
    @ApiProperty({ type: String, required: true })
    @IsString()
    @IsNotEmpty()
      campCode: string;
}
