import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty, IsOptional, IsString, IsArray,
} from 'class-validator';

/**
 * ⚠️ TESTING ONLY - Development/Testing Utility
 *
 * This DTO is used to generate encrypted tokens for testing without
 * going through the complete payment/email flow.
 *
 * In production, tokens are generated automatically by OrdersService
 * after ticket purchase and sent via email.
 *
 * This endpoint is only available in development mode (NODE_ENV=development).
 */
export class GenerateTestTokenDto {
  @ApiProperty({
    required: true,
    example: 'Dana Cohen',
    description: 'Customer full name',
  })
  @IsString()
  @IsNotEmpty()
    name: string;

  @ApiProperty({
    required: true,
    example: 'dana@example.com',
    description: 'Customer email',
  })
  @IsString()
  @IsNotEmpty()
    email: string;

  @ApiProperty({
    required: false,
    example: '050-123-4567',
    description: 'Customer phone number',
  })
  @IsString()
  @IsOptional()
    phone?: string;

  @ApiProperty({
    required: true,
    example: '6a434e6bab835dff0ef1fe46',
    description: 'SessionWrapper ID',
  })
  @IsString()
  @IsNotEmpty()
    wrapperId: string;

  @ApiProperty({
    required: false,
    example: 'SUMMER-2026',
    description: 'Event code',
  })
  @IsString()
  @IsOptional()
    eventCode?: string;

  @ApiProperty({
    required: false,
    example: 'TICKET-ABC12XYZ',
    description: 'Single-use booking code',
  })
  @IsString()
  @IsOptional()
    code?: string;

  @ApiProperty({
    required: false,
    example: ['יוזמה זוכרת', 'נשימה מחדש'],
    description: 'Event scope - restrict to specific event slugs',
    type: [String],
  })
  @IsArray()
  @IsOptional()
    scope?: string[];

  @ApiProperty({
    required: false,
    example: '6a434e6bab835dff0ef1fe46',
    description: 'OrderProduct (ticket) ID - for testing the cancellation gate',
  })
  @IsString()
  @IsOptional()
    orderProductId?: string;
}
