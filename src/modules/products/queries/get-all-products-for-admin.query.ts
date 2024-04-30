import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { GetAllProductsForLoggedInUserQuery } from 'src/modules/products/queries';

export class GetAllProductsForAdminQuery extends GetAllProductsForLoggedInUserQuery {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
    dmoId: string;
}
