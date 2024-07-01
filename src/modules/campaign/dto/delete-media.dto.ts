import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteMediaDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly mediaUrl: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly mediaType: string;
}
