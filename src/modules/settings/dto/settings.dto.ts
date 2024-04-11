import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SettingsDTO {
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
    title: string;

  @ApiProperty({
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
    description: string;
}
