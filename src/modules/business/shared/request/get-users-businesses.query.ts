import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { CommonStatus } from 'src/common/enum';
import { GetAllUnpaginatedBusinessQuery } from 'src/modules/business/shared/request';

export class GetUsersBusinessesQuery extends GetAllUnpaginatedBusinessQuery {
  @ApiProperty({ type: 'enum', enum: CommonStatus, required: false })
  @IsEnum(CommonStatus)
  @IsOptional()
    status: CommonStatus;
}
