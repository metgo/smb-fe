import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { BusinessStatus } from 'src/modules/business/business.type';
import { FilterQuery } from 'src/modules/business/dto/query.dto';

export class AllFilterQuery extends FilterQuery {
    @ApiProperty({ type: 'enum', enum: BusinessStatus, required: false })
    @IsEnum(BusinessStatus)
    @IsOptional()
      status: BusinessStatus;
}
