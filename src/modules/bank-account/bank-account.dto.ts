import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class BankAccountDTO {
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: 'string',
    required: false,
  })
  readonly bankNumber: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: 'string',
    required: false,
  })
  readonly branchNumber: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: 'string',
    required: false,
  })
  readonly accountNumber: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: 'string',
    required: false,
  })
  readonly businessNumberByGovt: string;
}
