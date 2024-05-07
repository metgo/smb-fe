import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

export class CreateDMODto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    name: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
    userId: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
    collaboratorsUser: [];
}
