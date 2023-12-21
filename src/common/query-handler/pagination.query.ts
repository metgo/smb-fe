import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class PaginationFilterQuery {
  @ApiProperty({ type: Number, required: false })
  @IsOptional()
    page: number;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
    limit: number;
}
