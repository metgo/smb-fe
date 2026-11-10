import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';
import { ReferenceType } from '../media.type';

export class DeleteMediaDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly imageUrl: string | null;

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

  @ApiProperty()
  @IsOptional()
  readonly businessImageType: string;
}
