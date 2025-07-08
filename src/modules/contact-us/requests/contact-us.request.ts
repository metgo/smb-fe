import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ContactUsRequest {
  @IsNotEmpty()
  @ApiProperty({ type: String, required: true })
    name: string;

  @IsNotEmpty()
  @ApiProperty({ type: String, required: true })
    phone: string;

  @IsEmail()
  @ApiProperty({ type: String, required: true })
    email: string;

  @IsNotEmpty()
  @ApiProperty({ type: String, required: true })
    message: string;

  @IsNotEmpty()
  @ApiProperty({ type: String, required: true })
    reason: string;

  @IsNotEmpty()
  @ApiProperty({ type: String, required: true })
    websiteIdentity: string;
}
