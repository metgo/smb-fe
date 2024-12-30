import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BankAccountDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: 'string',
    required: true,
  })
  readonly bankNumber: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: 'string',
    required: true,
  })
  readonly branchNumber: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: 'string',
    required: false,
  })
  readonly accountNumber: string;

  // @IsString()
  // @IsNotEmpty()
  // @ApiProperty({
  //   type: 'string',
  //   required: true,
  // })
  // readonly accountNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: 'string',
    required: true,
  })
  readonly businessNumberByGovt: string;
}
