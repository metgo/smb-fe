import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ExternalApiPostQuery {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
    identifierId: string;
}
