import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { PaginationFilterQuery } from 'src/common/query-handler/pagination.query';

export class GetProductsByCampaignRequest extends PaginationFilterQuery {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    customerEmail: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    voucherId: string;
}
