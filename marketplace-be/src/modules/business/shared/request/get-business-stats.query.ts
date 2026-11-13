import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { CommonStatus } from 'src/common/enum';

export class GetBusinessStatsQuery {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
    startDate: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
    endDate: string;

  @ApiProperty({
    type: [String],
    required: false,
    description: 'must follow the pattern \n [id, id,..]',
  })
  @IsOptional()
    categoriesId: string[];

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    dmoId: string;

  @ApiProperty({
    type: 'enum',
    enum: CommonStatus,
    required: false,
  })
  @IsEnum(CommonStatus)
  @IsOptional()
    status: CommonStatus;
}
