import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';
import { VoucherStatus } from 'src/common/enum';

export class FilterQuery {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
    search: string;

  @ApiProperty({ enum: VoucherStatus, required: false })
  @IsOptional()
    status: VoucherStatus;

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
