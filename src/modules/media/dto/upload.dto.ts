import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';
import { ReferenceType } from '../media.type';

export class UploadDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: 'string',
    required: true,
  })
  readonly refId: string;

  @ApiProperty({
    type: 'enum',
    enum: ReferenceType,
    required: true,
  })
  @IsEnum(ReferenceType)
  @IsNotEmpty()
  readonly reference: ReferenceType;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: 'string',
    required: false,
  })
  readonly businessId: string;
}
