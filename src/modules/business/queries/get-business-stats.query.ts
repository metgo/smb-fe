import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BusinessStatus } from 'src/modules/business/business.type';

export class GetBusinessStatsQuery {
  @ApiProperty({ type: Date, required: false })
  @IsOptional()
    startDate: Date;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
    endDate: Date;

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
    enum: BusinessStatus,
    required: false,
  })
  @IsEnum(BusinessStatus)
  @IsOptional()
    status: BusinessStatus;
}
