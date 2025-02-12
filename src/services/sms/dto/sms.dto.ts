import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SendSmsDto {
  @ApiProperty({ example: 'gal', description: 'First name of the recipient' })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
    firstName: string;

  @ApiProperty({ example: 'or', description: 'Last name of the recipient' })
  @IsString()
  @IsNotEmpty()
    lastName: string;

  @ApiProperty({ example: '+972', description: 'Country code' })
  @IsString()
  @IsNotEmpty()
    countryCode: string;

  @ApiProperty({ example: '508740131', description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
    phone: string;

  @ApiProperty({ example: 'ORD12345', description: 'Order number' })
  @IsString()
  @IsNotEmpty()
    orderNumber: string;

  @ApiProperty({ example: 'Metgo', description: 'Business name' })
  @IsString()
  @IsNotEmpty()
    businessName: string;

  @ApiProperty({ example: 'Laptop', description: 'Product name' })
  @IsString()
  @IsNotEmpty()
    productName: string;

  @ApiProperty({ example: '999.99', description: 'Price of the product' })
  @IsString()
  @IsNotEmpty()
    price: string;
}
