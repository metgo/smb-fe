import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty, IsString, IsArray, IsOptional,
} from 'class-validator';

export class ConfirmSessionHoldDto {
  @ApiProperty({
    required: true,
    type: [String],
    description:
      'Array of Hold IDs returned from POST /hold. Single session: ["id1"], Multiple sessions: ["id1", "id2"]',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
    holdIds: string[];

  @ApiProperty({
    required: true,
    description: 'Encrypted invite token (same token from URL)',
    example: 'abc123iv.xyz789cipher.def456tag',
  })
  @IsString()
  @IsNotEmpty()
    token: string;

  @ApiProperty({
    required: false,
    description:
      'Optional identifier ID linking booking to business branding (e.g. ExternalApi identifierId)',
    example: 'BNEI-FO5GZ43XDB6I5T',
  })
  @IsString()
  @IsOptional()
    identifierId?: string;

  @ApiProperty({
    required: false,
    description:
      'Optional comments from customer (injuries, accessibility needs, special requests, etc.)',
    example:
      'I have a knee injury, please arrange mat access near the entrance',
  })
  @IsString()
  @IsOptional()
    comments?: string;
}
