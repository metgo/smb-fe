import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class EventInfoDto {
  @ApiProperty({ example: '6a72bd86d983da43643d4320' })
  @IsMongoId()
    eventId: string;

  @ApiProperty({ type: [String], example: ['6a82f04dcfccc0c1b8cef83f'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
    ticketIds: string[];
}

export class PurchaserInfoDto {
  @ApiProperty({ example: 'traveller@example.com' })
  @IsEmail()
    email: string;

  @ApiProperty({ required: false, example: '0501234567' })
  @IsOptional()
  @IsString()
    phone?: string;
}

export class QuestionAnswerDto {
  @ApiProperty({ example: '6a82f04dcfccc0c1b8cef83f' })
  @IsMongoId()
    questionId: string;

  @ApiProperty({ example: 'No allergies' })
  @IsString()
  @IsNotEmpty()
    answer: string;
}

export class CreateEventTicketAnswerDto {
  @ApiProperty({ type: EventInfoDto })
  @ValidateNested()
  @Type(() => EventInfoDto)
    eventInfo: EventInfoDto;

  @ApiProperty({ type: PurchaserInfoDto })
  @ValidateNested()
  @Type(() => PurchaserInfoDto)
    purchaserInfo: PurchaserInfoDto;

  @ApiProperty({ type: [QuestionAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerDto)
    questionAnswer: QuestionAnswerDto[];
}
