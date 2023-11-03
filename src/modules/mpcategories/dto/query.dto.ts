import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class FilterQuery {
    @ApiProperty({ type: String, required: false })
    @IsOptional()
      search: string;

    @ApiProperty({ type: String, required: false, description: 'must follow the pattern \n [id, id,..]' })
    @IsOptional()
      mapPointId: string;
}
