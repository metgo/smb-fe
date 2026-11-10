import { ApiProperty } from '@nestjs/swagger';
import { ServicesTypes } from '../dashboard.type';

export class GetDefaultFilterResponse {
  @ApiProperty({ type: [String], required: true })
    categoryIds: string[];

  @ApiProperty({ type: [String], required: true })
    subCategoryIds: string[];

  @ApiProperty({ type: [String], required: true })
    groupTypeIds: string[];

  @ApiProperty({ type: [String], required: true })
    accessibilityIds: string[];

  @ApiProperty({ type: [ServicesTypes], required: true })
    serviceTypes: ServicesTypes[];
}
