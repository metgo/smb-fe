import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class FilterQuery {
    @ApiProperty({ type: String, required: false })
    @IsOptional()
      search: string;

    @ApiProperty({ type: Number, required: false })
    @IsNumber()
    @IsPositive()
    @IsOptional()
      page: number;

    @ApiProperty({ type: Number, required: false })
    @IsNumber()
    @IsPositive()
    @IsOptional()
      limit: number;
}
