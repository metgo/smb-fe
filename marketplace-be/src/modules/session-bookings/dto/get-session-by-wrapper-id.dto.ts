import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetSessionByWrapperIdDto {
  @ApiProperty({
    required: false,
    description: 'Filter by specific event ID',
    example: 'event_sound_bath',
  })
  @IsString()
  @IsOptional()
    eventId?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by specific date',
    example: '2026-07-11',
  })
  @IsString()
  @IsOptional()
    date?: string;

  @ApiProperty({
    required: false,
    description: 'Campaign code for tracking',
    example: 'SUMMER-2026',
  })
  @IsString()
  @IsOptional()
    code?: string;
}
