import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BusinessStatus } from 'src/modules/business/business.type';

export class GetALLBusinessProductStatsquery {
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
    enum: BusinessStatus,
    required: false,
  })
  @IsEnum(BusinessStatus)
  @IsOptional()
    status: BusinessStatus;
}
