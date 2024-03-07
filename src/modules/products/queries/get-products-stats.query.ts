import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetProductsStatsQuery {
  @ApiProperty({ type: Date, required: false })
  @IsOptional()
    startDate: Date;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
    endDate: Date;

  @ApiProperty({ type: [String], required: false, description: 'must follow the pattern \n [id, id,..]' })
  @IsOptional()
    categoriesId: string[];

  @ApiProperty({ type: String, required: false })
  @IsOptional()
    dmoId: string;
}
