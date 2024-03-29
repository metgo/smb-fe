import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

export class AssignUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly userId: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({ type: [String], required: true })
  readonly businessesId: string[];
}
