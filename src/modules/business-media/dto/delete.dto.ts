import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class DeleteMediaDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly imageUrl: string | null;
}
