import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMinSize, IsArray, IsMongoId } from 'class-validator';

export class GetQuestionsByTicketIdsDto {
  @ApiProperty({
    description: 'Comma-separated ticket ids',
    example: '6a72bd86d983da43643d4321,6a72bd86d983da43643d4322',
  })
  @Transform(({ value }) => (typeof value === 'string'
    ? value
      .split(',')
      .map((v: string) => v.trim())
      .filter(Boolean)
    : value))
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
    ticketIds: string[];
}
