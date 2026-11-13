import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SessionSlotDto {
  @ApiProperty({ required: true, example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
    sessionId: string;

  @ApiProperty({ required: true, example: 'אמבט צלילים ומנוחה עמוקה' })
  @IsString()
  @IsNotEmpty()
    sessionName: string;

  @ApiProperty({ required: true, example: '2026-07-11' })
  @IsString()
  @IsNotEmpty()
    slotDate: string;

  @ApiProperty({ required: true, example: '10:00' })
  @IsString()
  @IsNotEmpty()
    slotTime: string;

  @ApiProperty({ required: false, example: 'מאיה ר.' })
  @IsString()
  @IsOptional()
    room?: string;
}

export class CreateSessionHoldDto {
  @ApiProperty({
    required: true,
    description:
      'AES-256-GCM encrypted invite token from the booking email URL. '
      + 'Contains name/email/phone/wrapperId encrypted — cannot be read in the browser. '
      + 'Format: <iv_b64url>.<ciphertext_b64url>.<authTag_b64url>',
    example: 'abc123iv.xyz789cipher.def456tag',
  })
  @IsString()
  @IsNotEmpty()
    token: string;

  @ApiProperty({ required: true, example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
    wrapperId: string;

  @ApiProperty({
    required: true,
    type: [SessionSlotDto],
    description:
      'Array of 1-3 sessions to book atomically. TTL = 7 + (3 × extra sessions)',
    example: [
      {
        sessionId: '507f1f77bcf86cd799439011',
        sessionName: 'אמבט צלילים',
        slotDate: '2026-07-11',
        slotTime: '10:00',
        room: 'מאיה ר.',
      },
      {
        sessionId: '507f1f77bcf86cd799439012',
        sessionName: 'הנשימה',
        slotDate: '2026-07-12',
        slotTime: '14:00',
        room: 'מאיה ר.',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionSlotDto)
  @IsNotEmpty()
    sessions: SessionSlotDto[];
}
