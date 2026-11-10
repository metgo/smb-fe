import { ApiProperty } from '@nestjs/swagger';

export class GenerateTagResponse {
  @ApiProperty({ example: 'Tag in En' })
    en: string;

  @ApiProperty({ example: 'Tag in He' })
    he: string;

  @ApiProperty({ example: 'Tag in Ar' })
    ar: string;
}
