import { ApiProperty } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsIn, IsOptional,
} from 'class-validator';

export class BirthdaySmsDto {
  @ApiProperty({ example: 'John', description: 'First name of the recipient' })
  @IsString()
  @IsNotEmpty()
    firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the recipient' })
  @IsString()
  @IsNotEmpty()
    lastName: string;

  @ApiProperty({
    example: 'Enjoy your special day!',
    description: 'Custom birthday message (optional)',
  })
  @IsOptional()
  @IsString()
    message?: string;

  @ApiProperty({ example: '+972', description: 'Country code' })
  @IsString()
  @IsNotEmpty()
    countryCode: string;

  @ApiProperty({ example: '1234567890', description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
    phone: string;

  @ApiProperty({ example: '500', description: 'Gift amount in currency' })
  @IsString()
  @IsNotEmpty()
    price: string;

  @ApiProperty({ example: 'June', description: 'Month of birth' })
  @IsString()
  @IsNotEmpty()
    birthMonth: string;

  @ApiProperty({
    example: 'https://example.com/redeem',
    description: 'Gift voucher link',
  })
  @IsString()
  @IsNotEmpty()
    link: string;

  @ApiProperty({ example: '+972', description: 'Support country code' })
  @IsString()
  @IsNotEmpty()
    supportCountryCode: string;

  @ApiProperty({
    example: '123-456-7890',
    description: 'Technical support phone number',
  })
  @IsString()
  @IsNotEmpty()
    supportPhone: string;

  @ApiProperty({ example: 'VCHR12345', description: 'Gift voucher code' })
  @IsString()
  @IsNotEmpty()
    voucherCode: string;

  @ApiProperty({ example: 'John Doe', description: 'Sender name' })
  @IsString()
  @IsNotEmpty()
    senderName: string;

  @ApiProperty({ example: 'Manager', description: 'Sender position' })
  @IsString()
  @IsNotEmpty()
    senderPosition: string;

  @ApiProperty({
    example: 'Jane Doe',
    description: 'Additional sender name (optional)',
  })
  @IsOptional()
  @IsString()
    additionalSenderName?: string;

  @ApiProperty({
    example: 'Assistant',
    description: 'Additional sender position (optional)',
  })
  @IsOptional()
  @IsString()
    additionalSenderPosition?: string;

  @ApiProperty({
    example: 'en',
    description:
      'Preferred language for the SMS (en for English, he for Hebrew)',
  })
  @IsString()
  @IsIn(['en', 'he'])
    language: string;
}
