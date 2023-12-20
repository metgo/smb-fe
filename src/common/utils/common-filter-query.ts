import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CommonFilterQuery {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
    search: string;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
    page: number;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
    limit: number;
}
