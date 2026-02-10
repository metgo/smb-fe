import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';
import { TicketStatus, TicketType } from '../tickets.type';

export class GetAllTicketsRequest extends CommonFilterQuery {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
    eventId: string;

  @ApiProperty({
    required: false,
    enum: TicketStatus,
  })
  @IsOptional()
  @IsEnum(TicketStatus)
    status: TicketStatus;

  @ApiProperty({
    required: false,
    enum: TicketType,
  })
  @IsOptional()
  @IsEnum(TicketType)
    type: TicketType;
}
