import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class FilterQuery {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
    search: string;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
    size: number;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
    page: number;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
    limit: number;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
    dmoId: string;
}
