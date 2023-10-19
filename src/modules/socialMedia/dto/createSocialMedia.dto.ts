import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class createSocialMediaDto {
    @ApiProperty({
      required: true,
    })
    @IsString()
    @IsNotEmpty()
      name: string;

    @ApiProperty({
      required: true,
    })
    @IsString()
    @IsNotEmpty()
      icon: string;

    @ApiProperty({
      required: true,
    })
    @IsString()
    @IsNotEmpty()
      iconAlt: string;
}
